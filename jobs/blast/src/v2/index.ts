import { USDB, WETH } from 'src/lib/constants'
import { SUBGRAPH_HOST, SUSHISWAP_SUBGRAPH_NAME } from 'src/lib/graph'
import { LiquidityInfo, TrackedLiquidity } from 'src/lib/types'
import { ChainId } from 'sushi/chain'
import { PairAtBlocksQuery, PairsQuery, getBuiltGraphSDK } from '.graphclient'

const v2SDK = getBuiltGraphSDK({
  host: SUBGRAPH_HOST[ChainId.BLAST],
  name: SUSHISWAP_SUBGRAPH_NAME[ChainId.BLAST],
})

export async function getEligibleV2Pairs() {
  const { pairs } = await v2SDK.Pairs({
    where: {
      or: [
        { token0: USDB },
        { token0: WETH },
        { token1: USDB },
        { token1: WETH },
      ],
    },
  })

  return pairs
}

const getV2PairLiquidityInfo = (
  pair: PairAtBlocksQuery['pairAtBlocks'][number],
): LiquidityInfo => {
  if (+pair.liquidity === 0)
    return {
      reserve0: 0,
      reserve1: 0,
    }

  if (
    [USDB, WETH].includes(pair.token0.id) &&
    [USDB, WETH].includes(pair.token1.id)
  ) {
    return {
      reserve0:
        pair.token0.id === WETH
          ? pair.reserve0
          : pair.reserve0 * pair.token1Price,
      reserve1:
        pair.token1.id === WETH
          ? pair.reserve1
          : pair.reserve1 * pair.token0Price,
    }
  } else {
    return {
      reserve0: pair.reserve0,
      reserve1: pair.reserve1,
    }
  }
}

export async function getV2LiquidityOverBlocks(
  blocks: number[],
  pair: PairsQuery['pairs'][number],
): Promise<TrackedLiquidity> {
  const { pairAtBlocks } = await v2SDK.PairAtBlocks({
    id: pair.id,
    blocks: blocks.map((block) => ({ number: block })),
  })

  const usersLiquidity: Record<string, LiquidityInfo> = {}
  let totalLiquidity = {
    reserve0: 0,
    reserve1: 0,
  }
  pairAtBlocks.forEach((pairAtBlock) => {
    const pairLiquidityAtBlock = getV2PairLiquidityInfo({
      ...pairAtBlock,
      token0: pair.token0,
      token1: pair.token1,
    })

    pairAtBlock.liquidityPositions.forEach((position) => {
      if (+position.balance === 0) return

      const positionLiquidityAtBlock = {
        reserve0:
          (position.balance / pairAtBlock.liquidity) *
          pairLiquidityAtBlock.reserve0,
        reserve1:
          (position.balance / pairAtBlock.liquidity) *
          pairLiquidityAtBlock.reserve1,
      }

      usersLiquidity[position.user.id] = {
        reserve0:
          (usersLiquidity[position.user.id]?.reserve0 ?? 0) +
          positionLiquidityAtBlock.reserve0,
        reserve1:
          (usersLiquidity[position.user.id]?.reserve1 ?? 0) +
          positionLiquidityAtBlock.reserve1,
      }
      totalLiquidity = {
        reserve0: totalLiquidity.reserve0 + positionLiquidityAtBlock.reserve0,
        reserve1: totalLiquidity.reserve1 + positionLiquidityAtBlock.reserve1,
      }
    })
  })

  return {
    users: usersLiquidity,
    total: totalLiquidity,
  }
}

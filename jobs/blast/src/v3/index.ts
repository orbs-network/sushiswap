import { USDB, WETH } from 'src/lib/constants'
import {
  STEER_SUBGRAPH_FIRST_BLOCK,
  STEER_SUBGRAPH_URL,
  SUBGRAPH_HOST,
  SUSHISWAP_V3_SUBGRAPH_NAME,
} from 'src/lib/graph'
import { ChainId, LiquidityInfo, TrackedLiquidity } from 'src/lib/types'
import { uniswapV3PoolAbi } from 'sushi/abi'
import { publicClientConfig } from 'sushi/config'
import {
  PublicClientConfig,
  createPublicClient,
  encodePacked,
  keccak256,
} from 'viem'
import {
  V3PoolAtBlocksQuery,
  V3PoolsQuery,
  getBuiltGraphSDK,
} from '.graphclient'

export const v3SDK = getBuiltGraphSDK({
  host: SUBGRAPH_HOST[ChainId.BLAST],
  name: SUSHISWAP_V3_SUBGRAPH_NAME[ChainId.BLAST],
})

export const steerSDK = getBuiltGraphSDK({
  url: STEER_SUBGRAPH_URL[ChainId.BLAST],
})

const web3Client = createPublicClient(
  publicClientConfig[ChainId.BLAST] as PublicClientConfig,
)

export async function getEligbleV3Pools() {
  const { pools } = await getBuiltGraphSDK({
    host: SUBGRAPH_HOST[ChainId.BLAST],
    name: SUSHISWAP_V3_SUBGRAPH_NAME[ChainId.BLAST],
  }).V3Pools({
    where: {
      or: [
        { token0: USDB },
        { token0: WETH },
        { token1: USDB },
        { token0: WETH },
      ],
    },
  })

  return pools
}

const getV3PositionLiquidityInfo = ({
  liquidity,
  tickLower,
  tickUpper,
  poolAtBlock,
}: {
  liquidity: number
  tickLower: number
  tickUpper: number
  poolAtBlock: V3PoolAtBlocksQuery['v3PoolAtBlocks'][number]
}) => {
  if (liquidity === 0) {
    return {
      reserve0: 0,
      reserve1: 0,
    }
  }

  let reserve0 = 0
  let reserve1 = 0
  const currentTick = +poolAtBlock.tick
  const sqrtRatioA = Math.sqrt(1.0001 ** tickLower)
  const sqrtRatioB = Math.sqrt(1.0001 ** tickUpper)
  const sqrtPrice = poolAtBlock.sqrtPrice / 2 ** 96

  if (currentTick < tickLower) {
    reserve0 = Math.floor(
      liquidity * ((sqrtRatioB - sqrtRatioA) / (sqrtRatioA * sqrtRatioB)),
    )
  } else if (currentTick >= tickUpper) {
    reserve1 = Math.floor(liquidity * (sqrtRatioB - sqrtRatioA))
  } else if (currentTick >= tickLower && currentTick < tickUpper) {
    reserve0 = Math.floor(
      liquidity * ((sqrtRatioB - sqrtPrice) / (sqrtPrice * sqrtRatioB)),
    )
    reserve1 = Math.floor(liquidity * (sqrtPrice - sqrtRatioA))
  }

  reserve0 = reserve0 / 10 ** poolAtBlock.token0.decimals
  reserve1 = reserve1 / 10 ** poolAtBlock.token1.decimals

  if (
    [USDB, WETH].includes(poolAtBlock.token0.id) &&
    [USDB, WETH].includes(poolAtBlock.token1.id)
  ) {
    return {
      reserve0:
        poolAtBlock.token0.id === WETH
          ? reserve0
          : reserve0 * poolAtBlock.token1Price,
      reserve1:
        poolAtBlock.token1.id === WETH
          ? reserve1
          : reserve1 * poolAtBlock.token0Price,
    }
  } else {
    return { reserve0, reserve1 }
  }
}

export async function getSteerLiquidityOverBlocks(
  blocks: number[],
  pool: V3PoolsQuery['pools'][number],
): Promise<TrackedLiquidity> {
  const { v3PoolAtBlocks } = await v3SDK.V3PoolAtBlocks({
    id: pool.id,
    blocks: blocks.map((block) => ({ number: block })),
  })

  const steerVaultsAtBlocks = (
    await steerSDK!.SteerVaultsAtBlocks({
      where: { pool: pool.id },
      blocks: blocks
        .filter((block) => +block > STEER_SUBGRAPH_FIRST_BLOCK)
        .map((block) => ({ number: block })),
    })
  ).steerVaultsAtBlocks
    .filter(({ vaults }) => vaults.length)
    .map(({ vaults }) => vaults)

  const usersLiquidity: Record<string, LiquidityInfo> = {}
  let totalLiquidity: LiquidityInfo = {
    reserve0: 0,
    reserve1: 0,
  }

  steerVaultsAtBlocks.forEach(async (steerVaultsAtBlock, i) => {
    const blockIndex = blocks.length - steerVaultsAtBlocks.length + i
    const block = blocks[blockIndex]

    const contractReads = steerVaultsAtBlock.flatMap((vault) =>
      vault.positions.map((position) => ({
        address: pool.id as `0x${string}`,
        abi: uniswapV3PoolAbi,
        functionName: 'positions',
        args: [
          keccak256(
            encodePacked(
              ['address', 'int24', 'int24'],
              [
                vault.id as `0x${string}`,
                position.lowerTick[0],
                position.upperTick[0],
              ],
            ),
          ),
        ],
      })),
    )

    const positionsAtBlock = await web3Client.multicall({
      contracts: contractReads,
      blockNumber: BigInt(block),
    })

    let positionsCounter = 0
    const vaultsReserves = steerVaultsAtBlock.map((vault) =>
      vault.positions.reduce(
        (accum, cur) => {
          const liquidity = (
            positionsAtBlock[positionsCounter].result as bigint[]
          )[0]

          const { reserve0, reserve1 } = getV3PositionLiquidityInfo({
            liquidity: Number(liquidity),
            tickLower: +cur.lowerTick[0],
            tickUpper: +cur.upperTick[0],
            poolAtBlock: v3PoolAtBlocks[i],
          })

          accum.reserve0 += reserve0
          accum.reserve1 += reserve1

          ++positionsCounter
          return accum
        },
        { reserve0: 0, reserve1: 0 },
      ),
    )

    steerVaultsAtBlock.forEach((vault, i) => {
      vault.depositors.forEach((depositor) => {
        const userVaultLiquidity = {
          reserve0:
            (vaultsReserves[i].reserve0 * depositor.shares) /
            vault.totalLPTokensIssued,
          reserve1:
            (vaultsReserves[i].reserve1 * depositor.shares) /
            vault.totalLPTokensIssued,
        }

        usersLiquidity[depositor.account] = {
          reserve0:
            (usersLiquidity[depositor.account]?.reserve0 ?? 0) +
            userVaultLiquidity.reserve0,
          reserve1:
            (usersLiquidity[depositor.account]?.reserve1 ?? 0) +
            userVaultLiquidity.reserve1,
        }

        totalLiquidity = {
          reserve0: totalLiquidity.reserve0 + userVaultLiquidity.reserve0,
          reserve1: totalLiquidity.reserve1 + userVaultLiquidity.reserve1,
        }
      })
    })
  })

  return { users: usersLiquidity, total: totalLiquidity }
}

export async function getV3LiquidityOverBlocks(
  blocks: number[],
  pool: V3PoolsQuery['pools'][number],
): Promise<TrackedLiquidity> {
  const { v3PoolAtBlocks } = await v3SDK.V3PoolAtBlocks({
    id: pool.id,
    blocks: blocks.map((block) => ({ number: block })),
  })

  const usersLiquidity: Record<string, LiquidityInfo> = {}
  let totalLiquidity = {
    reserve0: 0,
    reserve1: 0,
  }

  v3PoolAtBlocks.forEach(async (poolAtBlock) => {
    if (+poolAtBlock.liquidity === 0) return

    poolAtBlock.positions.forEach((position) => {
      const positionLiquidityAtBlock = getV3PositionLiquidityInfo({
        liquidity: +position.liquidity,
        tickLower: +position.tickLower.tickIdx,
        tickUpper: +position.tickUpper.tickIdx,
        poolAtBlock,
      })

      if (
        positionLiquidityAtBlock.reserve0 === 0 &&
        positionLiquidityAtBlock.reserve1 === 0
      )
        return

      usersLiquidity[position.owner] = {
        reserve0:
          (usersLiquidity[position.owner]?.reserve0 ?? 0) +
          positionLiquidityAtBlock.reserve0,
        reserve1:
          (usersLiquidity[position.owner]?.reserve1 ?? 0) +
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

import type { ResultOf } from 'gql.tada'
import type { PoolFieldsFragment } from 'src/subgraphs/sushi-v2/fragments/pool-fields'
import type { SushiSwapV2ChainId } from 'sushi/config'
import {
  getIdFromChainIdAddress,
  withoutScientificNotation,
} from 'sushi/format'
import { type PoolBase, type PoolV2, SushiSwapProtocol } from 'sushi/types'

type ToPick =
  | 'id'
  | 'token0'
  | 'token1'
  | 'reserve0'
  | 'reserve1'
  | 'totalSupply'
  | 'liquidityUSD'
  | 'volumeUSD'
  | 'txCount'
  | 'token0Price'
  | 'token1Price'

type RequiredBase = Pick<ResultOf<typeof PoolFieldsFragment>, ToPick>

export function transformPoolV2ToBase<T extends RequiredBase>(
  pool: T,
  chainId: SushiSwapV2ChainId,
): PoolV2<PoolBase> {
  return {
    id: getIdFromChainIdAddress(chainId, pool.id),
    address: pool.id,
    chainId,
    name: `${pool.token0.symbol}-${pool.token1.symbol}`,

    swapFee: 0.003,

    protocol: SushiSwapProtocol.SUSHISWAP_V2,

    // reserve0: BigInt(pool.reserve0),
    // reserve1: BigInt(pool.reserve1),

    reserve0: BigInt(
      withoutScientificNotation(
        (Number(pool.reserve0) * 10 ** Number(pool.token0.decimals)).toFixed(),
      )!,
    ),
    reserve1: BigInt(
      withoutScientificNotation(
        (Number(pool.reserve1) * 10 ** Number(pool.token1.decimals)).toFixed(),
      )!,
    ),

    liquidity: BigInt(
      withoutScientificNotation(
        (Number(pool.totalSupply) * 10 ** 18).toFixed(),
      )!,
    ),
    liquidityUSD: Number(pool.liquidityUSD),

    volumeUSD: Number(pool.volumeUSD),
    feesUSD: Number(pool.volumeUSD) * 0.003,

    token0: {
      id: getIdFromChainIdAddress(chainId, pool.token0.id),
      address: pool.token0.id,
      chainId,
      decimals: Number(pool.token0.decimals),
      name: pool.token0.name,
      symbol: pool.token0.symbol,
    },
    token1: {
      id: getIdFromChainIdAddress(chainId, pool.token1.id),
      address: pool.token1.id,
      chainId,
      decimals: Number(pool.token1.decimals),
      name: pool.token1.name,
      symbol: pool.token1.symbol,
    },
    token0Price: Number(pool.token0Price),
    token1Price: Number(pool.token1Price),
    txCount: Number(pool.txCount),
  }
}

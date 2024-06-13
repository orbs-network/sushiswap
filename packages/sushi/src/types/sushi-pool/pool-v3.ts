import {
  type PoolId,
  SushiSwapProtocol,
  type SushiSwapV3Protocol,
} from 'sushi/types'
import type { SushiSwapV3ChainId } from '../../config/sushiswap-v3'

type Extension = {
  sqrtPrice: bigint
  tick: bigint
  observationIndex: bigint
  feeGrowthGlobal0X128: bigint
  feeGrowthGlobal1X128: bigint
}

export type PoolV3<T extends PoolId = PoolId> = T &
  Omit<PoolId, 'chainId' | 'protocol'> & {
    chainId: SushiSwapV3ChainId
    protocol: SushiSwapV3Protocol
  } & Extension

export function isPoolV3<T extends PoolV3>(pool: PoolId): pool is T {
  return pool.protocol === SushiSwapProtocol.SUSHISWAP_V3
}

import { ChainId as _ChainId } from 'sushi/chain'

export type PointType = 'LIQUIDITY' | 'DEVELOPER'

export type Transfer = {
  toAddress: string

  // decimal string
  // must be >= MINIMUM_TRANSFER_SIZE
  // must have decimal places <= MAX_TRANSFER_DECIMALS
  points: string
}

export type BatchRequest = {
  pointType: PointType

  // 1 <= transfers.length <= MAX_TRANSFERS_PER_BATCH
  // transfers[i].toAddress !== contractAddress (no self transfers)
  // count(transfers[].toAddress = address) <= 1 (only one transfer per address)
  transfers: Transfer[]

  // number of seconds to wait before finalizing this batch
  // must be between MINIMUM_FINALIZE_SECONDS and DEFAULT_FINALIZE_SECONDS
  // if not present, uses DEFAULT_FINALIZE_SECONDS
  secondsToFinalize?: number | null
}

export const ChainId = {
  ..._ChainId,
  BLAST_SEPOLIA: 168587773,
}

export type LiquidityInfo = {
  reserve0: number
  reserve1: number
}

export type TrackedLiquidity = {
  users: Record<string, LiquidityInfo>
  total: LiquidityInfo
}

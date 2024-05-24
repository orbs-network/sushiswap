import { SushiXSwap2ChainId } from 'sushi/config'
import { Address } from 'viem'
import { SushiXSwap2Adapter, SushiXSwapTransactionType } from '../lib'
import { getSquidCrossChainTrade } from './getSquidCrossChainTrade'
import { getStargateCrossChainTrade } from './getStargateCrossChainTrade'
import { GetTradeReturn } from './getTrade'

export interface GetCrossChainTradeParams {
  srcChainId: SushiXSwap2ChainId
  dstChainId: SushiXSwap2ChainId
  tokenIn: Address
  tokenOut: Address
  amount: bigint
  srcGasPrice: bigint
  dstGasPrice: bigint
  slippagePercentage: string
  recipient: Address
  maxPriceImpact?: number
}

export interface GetCrossChainTradeResult {
  adapter: SushiXSwap2Adapter
  priceImpact: bigint | undefined
  amountIn: bigint | undefined
  amountOut: bigint | undefined
  minAmountOut: bigint | undefined
  gasSpent: string | undefined
  bridgeFee: string | undefined
  srcGasFee: string | undefined
  functionName: string
  writeArgs: (string | object)[] | undefined
  route: { status: string }
  value: bigint | undefined
  transactionType: SushiXSwapTransactionType | undefined
  srcBridgeToken: Address | undefined
  dstBridgeToken: Address | undefined
  srcTrade: GetTradeReturn | undefined
  dstTrade: GetTradeReturn | undefined
}

export const getCrossChainTrade = async (params: GetCrossChainTradeParams) => {
  return (
    await Promise.all([
      getSquidCrossChainTrade(params),
      getStargateCrossChainTrade(params),
    ])
  ).filter((resp) => !!resp)
}

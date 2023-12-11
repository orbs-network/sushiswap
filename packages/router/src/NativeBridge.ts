import { ChainId } from 'sushi/chain'
import { LiquidityProviders, NativeWrapBridgePoolCode } from '.'
import { BridgeUnlimited, RToken } from '@sushiswap/tines'
import { Native, WNATIVE, WNATIVE_ADDRESS } from 'sushi/currency'

export function getNativeWrapBridgePoolCode(
  chainId: ChainId,
): NativeWrapBridgePoolCode {
  const native = Native.onChain(chainId)
  const nativeRToken: RToken = {
    address: '',
    name: native.name,
    symbol: native.symbol,
    chainId: chainId,
    decimals: 18,
  }
  return new NativeWrapBridgePoolCode(
    new BridgeUnlimited(
      WNATIVE_ADDRESS[chainId],
      nativeRToken,
      WNATIVE[chainId] as RToken,
      0,
      50_000,
    ),
    LiquidityProviders.NativeWrap,
  )
}

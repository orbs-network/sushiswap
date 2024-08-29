'use client'

import { Web3Input } from 'src/lib/wagmi/components/web3-input'
import { isWNativeSupported } from 'sushi/config'
import { useDerivedStateTwapSwap, useDstTokenAmount, useTwapSwapTrade } from './derivedstate-twap-swap-provider'

export const TwapSwapToken1Input = () => {
  const {
    state: { chainId, token1 },
    mutate: { setToken1 },
    isToken1Loading: tokenLoading,
  } = useDerivedStateTwapSwap()

  const {isLoading, amount} = useDstTokenAmount()

  return (
    <Web3Input.Currency
      id="swap-to"
      type="OUTPUT"
      disabled
      className="border border-accent p-3 bg-white dark:bg-slate-800 rounded-xl"
      value={amount?.toExact() || ''}
      chainId={chainId}
      onSelect={setToken1}
      currency={token1}
      loading={isLoading}
      fetching={false}
      disableMaxButton
      currencyLoading={tokenLoading}
      allowNative={isWNativeSupported(chainId)}
      label="Buy"
      // priceImpact={trade?.priceImpact}
    />
  )
}

'use client'
import React from 'react'
import { Web3Input } from 'src/lib/wagmi/components/web3-input'
import { isWNativeSupported } from 'sushi/config'
import { useDerivedStateTwapSwap } from './derivedstate-twap-swap-provider'

export const TwapSwapToken0Input = () => {
  const {
    state: { swapAmountString, chainId, token0 },
    mutate: { setSwapAmount, setToken0 },
    isToken0Loading: isLoading,
  } = useDerivedStateTwapSwap()

  return (
    <Web3Input.Currency
      id="swap-from"
      type="INPUT"
      className="border border-accent p-3 bg-white dark:bg-slate-800 rounded-xl"
      chainId={chainId}
      onSelect={setToken0}
      value={swapAmountString}
      onChange={setSwapAmount}
      currency={token0}
      loading={isLoading}
      currencyLoading={isLoading}
      allowNative={isWNativeSupported(chainId)}
      label="Sell"
    />
  )
}

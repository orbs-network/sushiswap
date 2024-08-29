'use client'

import { SwapModeButtons } from '../swap-mode-buttons'
import {MaintenanceMessage } from './maintenance-message'
import { TwapSwapToken0Input } from './twap-swap-token0-input'
import { TwapSwapToken1Input } from './twap-swap-token1-input'
import { DerivedstateTwapSwapProvider } from './derivedstate-twap-swap-provider'
import { TwapSwapHeader } from './twap-swap-header'
import { TwapSwapSettingsOverlay } from './twap-swap-settings-overlay'
import { TwapSwapBridgeBanner } from './twap-swap-bridge-banner'
import { TwapSwapSwitchTokensButton } from './twap-swap-switch-tokens-button'
import { TwapSwapTradeButton } from './twap-swap-trade-button'


export function SwapWidget({ isLimit }: { isLimit?: boolean }) {
  return (
    <DerivedstateTwapSwapProvider isLimit={isLimit}>
    <div className="flex flex-col gap-4">
      <TwapSwapBridgeBanner />
      <TwapSwapHeader />
      <div className="flex items-center justify-between">
        <SwapModeButtons />
        <TwapSwapSettingsOverlay />
      </div>
      <MaintenanceMessage />
        <TwapSwapToken0Input />
        <TwapSwapSwitchTokensButton />
        <div className="flex flex-col">
        <TwapSwapToken1Input />
        <TwapSwapTradeButton />
      </div>
    </div>
    </DerivedstateTwapSwapProvider>

  )
}


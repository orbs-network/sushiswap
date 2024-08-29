'use client'

import { SettingsModule, SettingsOverlay } from '@sushiswap/ui'
import { TwapSwapApi } from './swap-api-setting'


export const TwapSwapSettingsOverlay = () => {
  return (
    <SettingsOverlay
      modules={[
        SettingsModule.SlippageTolerance,
        // SettingsModule.ExpertMode,
        // SettingsModule.TransactionDeadline,
        // SettingsModule.CarbonOffset
      ]}
      externalModules={[TwapSwapApi]}
    />
  )
}

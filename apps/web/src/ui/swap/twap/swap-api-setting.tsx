'use client'

import React, { FC } from 'react'

import { Label, Switch, typographyVariants } from '@sushiswap/ui'
import { useDerivedStateTwapSwap } from './derivedstate-twap-swap-provider'

export const TwapSwapApi: FC = () => {
  const {
    mutate: { setForceClient },
    state: { forceClient },
  } = useDerivedStateTwapSwap()

  return (
    <div className="p-4 rounded-lg">
      <div className="flex justify-between items-center gap-4">
        <div className="flex flex-col gap-2">
          <Label>Swap API</Label>
          <span
            className={typographyVariants({
              variant: 'muted',
              className: 'text-sm',
            })}
          >
            Switch to the client for trade discovery by deactivating the Swap
            API.
          </span>
        </div>
        <Switch
          checked={!forceClient}
          onCheckedChange={(checked) => setForceClient(!checked)}
        />
      </div>
    </div>
  )
}

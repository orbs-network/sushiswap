'use client'

import { Message } from '@sushiswap/ui'
import { useDerivedStateTwapSwap } from './derivedstate-twap-swap-provider'
import { useIsMaitenance } from './use-is-maintenance'

export const MaintenanceMessage = () => {
  const { data: isMaintenance } = useIsMaitenance()
  const {isLimit} = useDerivedStateTwapSwap() 

  if(!isMaintenance) {
      return null
  }

  return <Message variant="warning" size="sm" className="text-center font-medium">
      {isLimit ? 'Limit' : 'DCA'} orders are currently undergoing maintenance. Please check back
        later.
      </Message>
}

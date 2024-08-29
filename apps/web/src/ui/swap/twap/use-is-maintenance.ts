import React from 'react'
import { useQuery } from '@tanstack/react-query'
import ms from 'ms'
import { DCAEdgeConfig } from 'src/app/(evm)/(trade)/dca/get-dca-edge-config'
import { useEdgeConfig } from 'src/providers/edge-config-provider'
import { useDerivedStateTwapSwap } from './derivedstate-twap-swap-provider'

export const useIsMaitenance = () => {
    const {isLimit} = useDerivedStateTwapSwap()
    const { maintenance } = useEdgeConfig<DCAEdgeConfig>()
    const queryKey = isLimit ? ['limit-maintenance'] : ['dca-maintenance']
    return useQuery({
      queryKey: queryKey,
      queryFn: async () => {
        const api = isLimit ? '/api/config/limit' : '/api/config/dca'
        const resp = await fetch(api, {
          next: { revalidate: 60 },
        })
        const data = await resp.json()
  
        if (data.success && data.data) {
          return data.data.maintenance as boolean
        }
  
        return false
      },
      initialData: maintenance,
      refetchInterval: ms('1m'),
    })
  }


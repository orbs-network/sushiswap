import { useQuery } from '@tanstack/react-query'
import ms from 'ms'
import { LimitEdgeConfig } from 'src/app/(evm)/(trade)/limit/get-limit-edge-config'
import { useEdgeConfig } from 'src/providers/edge-config-provider'

export const useIsLimitMaintenance = () => {
  const { maintenance } = useEdgeConfig<LimitEdgeConfig>()

  return useQuery({
    queryKey: ['limit-maintenance'],
    queryFn: async () => {
      const resp = await fetch('/api/config/limit', {
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

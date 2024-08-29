import { EdgeProvider } from 'src/providers/edge-config-provider'
import { DerivedstateTwapSwapProvider } from 'src/ui/swap/twap/derivedstate-twap-swap-provider'
import { getDCAEdgeConfig } from './get-dca-edge-config'

export async function Providers({ children }: { children: React.ReactNode }) {
  const config = await getDCAEdgeConfig()

  return (
    <EdgeProvider config={config}>
      <DerivedstateTwapSwapProvider>
        {children}
      </DerivedstateTwapSwapProvider>
    </EdgeProvider>
  )
}

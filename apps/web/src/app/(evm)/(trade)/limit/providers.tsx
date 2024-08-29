import { EdgeProvider } from 'src/providers/edge-config-provider'
import { getLimitEdgeConfig } from './get-limit-edge-config'

export async function Providers({ children }: { children: React.ReactNode }) {
  const config = await getLimitEdgeConfig()

  return (
    <EdgeProvider config={config}>
      {children}
    </EdgeProvider>
  )
}

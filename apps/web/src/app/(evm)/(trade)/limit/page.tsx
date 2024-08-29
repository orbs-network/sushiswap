import { Container } from '@sushiswap/ui'
import dynamic from 'next/dynamic'
import { Providers } from './providers'
const SwapWidget = dynamic(
  () => import('src/ui/swap/twap/twap').then((it) => it.SwapWidget),
  { ssr: false },
)

export const metadata = {
  title: 'Limit Order',
  description: 'SushiSwap Limit Order',
}

export default function SwapLimitPage() {
  return (
    <Providers>
      <Container maxWidth="lg" className="px-4">
        <SwapWidget isLimit={true} />
      </Container>
    </Providers>
  )
}

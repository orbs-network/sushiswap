import { Container } from '@sushiswap/ui'
import { CrossChainSwapWidget } from 'src/ui/swap/cross-chain/cross-chain-swap-widget'

import { Providers } from './providers'

export const metadata = {
  title: 'Cross-Chain Swap',
  description: 'SushiSwap Cross-Chain Swap',
}

export default async function CrossChainSwapPage() {
  return (
    <Providers>
      <Container maxWidth="lg" className="px-4">
        <CrossChainSwapWidget />
      </Container>
    </Providers>
  )
}

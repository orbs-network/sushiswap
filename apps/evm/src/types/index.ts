import { SushiSwapV2ChainId } from '@sushiswap/v2-sdk'
import { SushiSwapV3ChainId } from '@sushiswap/v3-sdk'

export type SwapChainId = SushiSwapV2ChainId | SushiSwapV3ChainId

import { Pool } from '@sushiswap/client'
import { Pool as Pool2 } from '@sushiswap/client2'
import { UserPosition } from '@sushiswap/graph-client'

export interface PositionWithPool extends Omit<UserPosition, 'pool'> {
  pool: Pool
}

export interface PositionWithPool2 extends Omit<UserPosition, 'pool'> {
  pool: Pool2
}

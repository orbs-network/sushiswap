import { ChainId } from 'sushi/chain'
import { USDB_ADDRESS, WNATIVE_ADDRESS } from 'sushi/currency'

export const BASE_URL = 'https://waitlist-api.prod.blast.io'
export const TEST_BASE_URL = 'https://waitlist-api.develop.testblast.io'

export const USDB = USDB_ADDRESS[ChainId.BLAST]
export const WETH = WNATIVE_ADDRESS[ChainId.BLAST]
export const TEST_USDB = '0x4200000000000000000000000000000000000022'
export const TEST_WETH = '0x4200000000000000000000000000000000000023'

export const POINTS_PER_BLOCK_PER_ETH = 0.06504987
export const MAX_TRANSFERS_PER_BATCH = 2000
export const MINIMUM_TRANSFER_SIZE = 0.01
export const MAX_TRANSFER_DECIMALS = 12

export const BLOCKS_PER_SECOND = 0.5

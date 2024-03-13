import {
  BLOCKS_SUBGRAPH_NAME as _BLOCKS_SUBGRAPH_NAME,
  STEER_SUBGRAPH_URL as _STEER_SUBGRAPH_URL,
  SUBGRAPH_HOST as _SUBGRAPH_HOST,
  SUSHISWAP_SUBGRAPH_NAME as _SUSHISWAP_SUBGRAPH_NAME,
  SUSHISWAP_V3_SUBGRAPH_NAME as _SUSHISWAP_V3_SUBGRAPH_NAME,
} from '@sushiswap/graph-config'
import { ChainId } from './types'

export const SUBGRAPH_HOST = {
  ..._SUBGRAPH_HOST,
  [ChainId.BLAST_SEPOLIA]: 'api.studio.thegraph.com/proxy/67045',
}

export const SUSHISWAP_V3_SUBGRAPH_NAME = {
  ..._SUSHISWAP_V3_SUBGRAPH_NAME,
  [ChainId.BLAST_SEPOLIA]: 'blast-test-v3/v0.0.1',
}

export const SUSHISWAP_SUBGRAPH_NAME = {
  ..._SUSHISWAP_SUBGRAPH_NAME,
  [ChainId.BLAST_SEPOLIA]: 'blast-test-v2/v0.0.1',
}

export const BLOCKS_SUBGRAPH_NAME = {
  ..._BLOCKS_SUBGRAPH_NAME,
  [ChainId.BLAST_SEPOLIA]: 'blast-test-blocks/v.0.0.1',
}

export const STEER_SUBGRAPH_URL = {
  ..._STEER_SUBGRAPH_URL,
  [ChainId.BLAST]:
    'api.goldsky.com/api/public/project_clohj3ta78ok12nzs5m8yag0b/subgraphs/steer-protocol-blast/1.1.1/gn',
}

export const STEER_SUBGRAPH_FIRST_BLOCK = 411009

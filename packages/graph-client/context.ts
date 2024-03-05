import { type ChainId } from 'sushi/chain'
import { MeshContext } from '@graphql-mesh/runtime'

export interface Context extends MeshContext {
  subgraphName: string
  subgraphHost: string
  chainId: ChainId
}

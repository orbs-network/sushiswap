import { v3PoolAtBlocks } from './v3PoolAtBlocks'
import { Resolvers } from '.graphclient'

export const resolvers: Resolvers = {
  Query: {
    v3PoolAtBlocks,
  },
}

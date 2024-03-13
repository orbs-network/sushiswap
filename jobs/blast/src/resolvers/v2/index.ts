import { pairAtBlocks } from './pairAtBlocks'
import { Resolvers } from '.graphclient'

export const resolvers: Resolvers = {
  Query: {
    pairAtBlocks,
  },
}

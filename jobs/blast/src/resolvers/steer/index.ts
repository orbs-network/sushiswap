import { steerVaultsAtBlocks } from './steerVaultsAtBlocks'

import { Resolvers } from '.graphclient'

export const resolvers: Resolvers = {
  Query: {
    steerVaultsAtBlocks,
  },
}

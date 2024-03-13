import { mergeResolvers } from '@graphql-tools/merge'

import { resolvers as steer } from './steer/index.js'
import { resolvers as v2 } from './v2/index.js'
import { resolvers as v3 } from './v3/index.js'
import { Resolvers } from '.graphclient'

export const resolvers: Resolvers = mergeResolvers([v2, v3, steer])

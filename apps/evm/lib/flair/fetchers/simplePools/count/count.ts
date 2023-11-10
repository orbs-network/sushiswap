import { parseArgs } from '@sushiswap/client'
import { PoolsArgs, PoolsCount } from '@sushiswap/rockset-client'
import { FLAIR_POOL_API_URL } from '../../common'

export const getPoolsCountUrl = (args: PoolsArgs) => {
  return `${FLAIR_POOL_API_URL}/simplePools/count${parseArgs(args)}`
}

export const getPoolsCount = async (
  args: PoolsArgs,
  init?: RequestInit,
): Promise<PoolsCount> => {
  const url = getPoolsCountUrl(args)
  return fetch(url, init).then((data) => data.json())
}

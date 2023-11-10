import { AnalyticsBucket, BucketsArgs } from '@sushiswap/rockset-client'
import { useQuery } from '@tanstack/react-query'
import type { QueryParams } from 'lib/flair/hooks/common'
import {
  getBuckets,
  getBucketsUrl,
} from '../../../fetchers/analytics/buckets/buckets'

export const useAnalyticBuckets = (
  args: BucketsArgs,
  queryParams?: QueryParams<AnalyticsBucket[]>,
) => {
  return useQuery({
    ...queryParams,
    queryKey: [getBucketsUrl(args)],
    queryFn: () => getBuckets(args),
  })
}

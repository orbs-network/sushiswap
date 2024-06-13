import type { VariablesOf } from 'gql.tada'
import type { SushiSwapV2ChainId } from 'sushi/config'
import { SUSHISWAP_V2_SUBGRAPH_URL } from 'sushi/config/subgraph'
import type { PoolBase, PoolV2 } from 'sushi/types'

import { FetchError } from 'src/lib/fetch-error'
import type { RequestOptions } from 'src/lib/request'
import { requestPaged } from 'src/lib/request-paged'
import type { ChainIdVariable } from 'src/lib/types/chainId'
import { transformPoolV2ToBase } from 'src/subgraphs/sushi-v2/transforms/pool-v2-to-base'
import { PoolFieldsFragment } from '../fragments/pool-fields'
import { graphql } from '../graphql'

export const SushiV2PoolsQuery = graphql(
  `
  query Pools($first: Int = 1000, $skip: Int = 0, $block: Block_height, $orderBy: Pair_orderBy, $orderDirection: OrderDirection, $where: Pair_filter) {
    pairs(first: $first, skip: $skip, block: $block, orderBy: $orderBy, orderDirection: $orderDirection, where: $where) {
      ...PoolFields
    }
  }
`,
  [PoolFieldsFragment],
)

export type GetSushiV2Pools = VariablesOf<typeof SushiV2PoolsQuery> &
  ChainIdVariable<SushiSwapV2ChainId>

export type SushiV2Pools = PoolV2<PoolBase>[]

export async function getSushiV2Pools(
  { chainId, ...variables }: GetSushiV2Pools,
  options?: RequestOptions,
): Promise<SushiV2Pools> {
  const url = `https://${SUSHISWAP_V2_SUBGRAPH_URL[chainId]}`

  const result = await requestPaged({
    chainId,
    url,
    query: SushiV2PoolsQuery,
    variables,
    options,
  })

  if (result) {
    return result.pairs.map((pool) => transformPoolV2ToBase(pool, chainId))
  }

  throw new FetchError(chainId, 'Failed to fetch pools')
}

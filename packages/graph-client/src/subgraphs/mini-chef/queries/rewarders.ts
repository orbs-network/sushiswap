import type { VariablesOf } from 'gql.tada'

import type { RequestOptions } from 'src/lib/request'
import { requestPaged } from 'src/lib/request-paged'
import type { ChainIdVariable } from 'src/lib/types/chainId'
import type { MiniChefChainId } from 'sushi/config'
import { MINICHEF_SUBGRAPH_URL } from 'sushi/config/subgraph'
import { graphql } from '../graphql'

export const MiniChefRewardersQuery = graphql(
  `
query MiniChefRewarders(
  $first: Int = 1000
  $skip: Int = 0
  $where: Rewarder_filter
  $block: Block_height
) {
  rewarders: rewarders(first: $first, skip: $skip, where: $where, block: $block) {
    id
    rewardToken
    rewardPerSecond
  }
}

`,
)

export type GetMiniChefRewarders = VariablesOf<typeof MiniChefRewardersQuery> &
  ChainIdVariable<MiniChefChainId>

export async function getMiniChefRewarders(
  { chainId, ...variables }: GetMiniChefRewarders,
  options?: RequestOptions,
) {
  const url = `https://${MINICHEF_SUBGRAPH_URL[chainId]}`

  const result = await requestPaged({
    chainId,
    url,
    query: MiniChefRewardersQuery,
    variables,
    options,
  })

  return result.rewarders.map((rewarder) => {
    // TODO: multichain id for rewardToken?
    return {
      id: rewarder.id,
      address: rewarder.rewardToken,
      rewardPerSecond: BigInt(rewarder.rewardPerSecond),
    }
  })
}

export type MiniChefRewarders = Awaited<ReturnType<typeof getMiniChefRewarders>>

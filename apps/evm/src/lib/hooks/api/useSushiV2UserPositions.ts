'use client'

import { parseArgs } from '@sushiswap/client'
import { useQuery } from '@tanstack/react-query'
import { UserWithPool } from 'src/app/pool/api/user-with-pools/route'
import { ChainId } from 'sushi/chain'
import type { GetSushiV2StakedUnstakedPositions } from '../../../../../../packages/graph-client/dist/composite/sushi-v2-staked-unstaked-positions'

export interface GetUserArgs {
  id?: string
  chainIds?: ChainId[]
}

export function getUserPositionsWithPoolsUrl(
  args: GetSushiV2StakedUnstakedPositions,
) {
  return `/pool/api/user-with-pools/${parseArgs(args)}`
}

export function useSushiV2UserPositions(
  args: GetSushiV2StakedUnstakedPositions,
  shouldFetch = true,
) {
  return useQuery<UserWithPool[]>({
    queryKey: [getUserPositionsWithPoolsUrl(args)],
    queryFn: () =>
      fetch(getUserPositionsWithPoolsUrl(args))
        .then((data) => data.text())
        .then(JSON.parse),
    enabled: Boolean(shouldFetch && args.id),
  })
}

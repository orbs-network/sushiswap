import type { VariablesOf } from 'gql.tada'
import type { SushiSwapV2ChainId } from 'sushi/config'
import { SUSHISWAP_V2_SUBGRAPH_URL } from 'sushi/config/subgraph'

import { addChainId } from 'src/lib/modifiers/add-chain-id'
import { convertIdToMultichainId } from 'src/lib/modifiers/convert-id-to-multichain-id'
import { copyIdToAddress } from 'src/lib/modifiers/copy-id-to-address'
import type { RequestOptions } from 'src/lib/request'
import { requestPaged } from 'src/lib/request-paged'
import type { ChainIdVariable } from 'src/lib/types/chainId'
import { graphql } from '../graphql'

export const SushiV2TokensQuery = graphql(`
  query Tokens($first: Int = 1000, $skip: Int = 0, $block: Block_height, $orderBy: Token_orderBy, $orderDirection: OrderDirection, $where: Token_filter) {
    tokens(first: $first, skip: $skip, block: $block, orderBy: $orderBy, orderDirection: $orderDirection, where: $where) {
      id
      name
      symbol
      decimals
      volumeUSD: tradeVolumeUSD
      totalLiquidity
    }
  }
`)

export type GetSushiV2Tokens = VariablesOf<typeof SushiV2TokensQuery> &
  ChainIdVariable<SushiSwapV2ChainId>

export async function getSushiV2Tokens(
  { chainId, ...variables }: GetSushiV2Tokens,
  options?: RequestOptions,
) {
  const url = `https://${SUSHISWAP_V2_SUBGRAPH_URL[chainId]}`

  const result = await requestPaged({
    chainId,
    url,
    query: SushiV2TokensQuery,
    variables,
    options,
  })

  return result.tokens.map((token) =>
    convertIdToMultichainId(copyIdToAddress(addChainId(chainId, token))),
  )
}

export type SushiV2Tokens = Awaited<ReturnType<typeof getSushiV2Tokens>>

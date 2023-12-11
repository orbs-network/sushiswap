import { PoolCode } from '@sushiswap/router'
import { Token } from 'sushi/currency'
import { Address } from 'viem'
import { EnabledExtractorChainId } from '../config'

export async function getPoolCodesForTokensFull(tokens: Token[]) {
  console.log({ tokens })
  return { prefetched: [] as PoolCode[], fetchingNumber: 0 }
}

export async function getCurrentPoolCodes(
  chainId: EnabledExtractorChainId,
): Promise<PoolCode[]> {
  const SERVER_ADDRESS = process.env['EXTRACTOR_URL'] ?? `http://extractor-${chainId}`
  // TODO: do we pass in full token info or fetch it from the manager again?
  const requestUrl = `${SERVER_ADDRESS}/pool-codes`
  try {
    const resp = await fetch(requestUrl)
    const json = (await resp.json()) as string
    const respObj = JSON.parse(json)
    // res = respObj.route.status
    console.log({ respObj })
    return respObj as PoolCode[]
  } catch (e) {
    console.log('Failed request:', requestUrl, e)
    // return 'Failed'
    return []
  }
}

export async function getCurrentPoolCodesForTokens(
  chainId: EnabledExtractorChainId,
  tokenIn: string,
  tokenOut: string,
): Promise<PoolCode[]> {
  const SERVER_ADDRESS = process.env['EXTRACTOR_URL'] ?? `http://extractor-${chainId}`
  // TODO: do we pass in full token info or fetch it from the manager again?
  const requestUrl = `${SERVER_ADDRESS}/pool-codes-for-tokens?tokenIn=${tokenIn}&tokenOut=${tokenOut}`
  try {
    const resp = await fetch(requestUrl)
    const json = (await resp.json()) as string
    const respObj = JSON.parse(json)
    // res = respObj.route.status
    console.log({ respObj })
    return respObj as PoolCode[]
  } catch (e) {
    console.log('Failed request:', requestUrl, e)
    // return 'Failed'
    return []
  }
}

export async function findToken(address: Address): Promise<Token | undefined> {
  console.log({ address })
  return undefined
}

export async function getKnownToken(address: Address): Promise<Token | undefined> {
    console.log({ address })
    return undefined
  }
  
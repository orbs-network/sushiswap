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
  const requestUrl = `${SERVER_ADDRESS}/pool-codes`
  try {
    const resp = await fetch(requestUrl)
    const json = (await resp.json()) as string
    // const respObj = JSON.parse(json)
    // res = respObj.route.status
    const { deserialize } = await import('wagmi')
    return deserialize(json) as PoolCode[]
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
  const requestUrl = `${SERVER_ADDRESS}/pool-codes-for-tokens?chainId=${chainId}&tokenIn=${tokenIn}&tokenOut=${tokenOut}`
  try {
    const resp = await fetch(requestUrl)
    const json = (await resp.json()) as string
    // const respObj = JSON.parse(json)
    // res = respObj.route.status
    // return respObj as PoolCode[]
    const { deserialize } = await import('wagmi')
    return deserialize(json) as PoolCode[]
  } catch (e) {
    console.log('Failed request:', requestUrl, e)
    // return 'Failed'
    return []
  }
}

export async function findToken(chainId: EnabledExtractorChainId, address: Address): Promise<Token | undefined> {
    const SERVER_ADDRESS = process.env['EXTRACTOR_URL'] ?? `http://extractor-${chainId}`
    const requestUrl = `${SERVER_ADDRESS}/token?chainId=${chainId}&address=${address}`
    try {
      const resp = await fetch(requestUrl)
      const json = (await resp.json()) as string
      const respObj = JSON.parse(json)
      return respObj as Token
    } catch (e) {
      console.log('Failed request:', requestUrl, e)
      return undefined
    }
}

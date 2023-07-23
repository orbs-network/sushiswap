import { ChainId } from '@sushiswap/chain'
import { Native } from '@sushiswap/currency'
import { NativeWrapProvider, PoolCode, Router } from '@sushiswap/router'
import { BASES_TO_CHECK_TRADES_AGAINST } from '@sushiswap/router-config'
import { config } from '@sushiswap/viem-config'
import cors from 'cors'
import { BigNumber } from 'ethers'
import express, { Express, Request, Response } from 'express'
import path from 'path'
import { Address, createPublicClient } from 'viem'
import z from 'zod'

import { Extractor, MultiCallAggregator, TokenManager } from '../src'
import {
  EXTRACTOR_CONFIG,
  isSupportedChainId,
  ROUTE_PROCESSOR_3_ADDRESS,
  SupportChainId,
  SUPPORTED_CHAIN_IDS,
} from './config'

const querySchema = z.object({
  chainId: z.coerce
    .number()
    .int()
    .gte(0)
    .lte(2 ** 256)
    .default(ChainId.ETHEREUM)
    .refine((chainId) => isSupportedChainId(chainId), { message: 'ChainId not supported.' })
    .transform((chainId) => chainId as SupportChainId),
  tokenIn: z.string(),
  tokenOut: z.string(),
  amount: z.string().transform((amount) => BigInt(amount)),
  gasPrice: z.optional(z.coerce.number().int().gt(0)),
  to: z.optional(z.string()),
  preferSushi: z.optional(z.coerce.boolean()),
})

const PORT = 3000

const extractors = new Map<SupportChainId, Extractor>()
const tokenManagers = new Map<SupportChainId, TokenManager>()
const nativeProviders = new Map<SupportChainId, NativeWrapProvider>()

async function setup() {
  for (const chainId of SUPPORTED_CHAIN_IDS) {
    const client = createPublicClient(config[chainId])
    const extractor = new Extractor({ ...EXTRACTOR_CONFIG[chainId], client })
    await extractor.start()
    // await Promise.all(
    //   extractor?.extractorV2?.factories?.map((f) => extractor?.extractorV2?.addPoolsFromFactory(f?.address))
    // )
    extractors.set(chainId, extractor)

    const tokenManager = new TokenManager(
      extractor?.multiCallAggregator as MultiCallAggregator,
      path.resolve(__dirname, '../cache'),
      `./tokens-${chainId}`
    )
    await tokenManager.addCachedTokens()
    tokenManagers.set(chainId, tokenManager)

    const nativeProvider = new NativeWrapProvider(chainId, client)
    nativeProviders.set(chainId, nativeProvider)
  }
}

async function main() {
  await setup()

  const app: Express = express()

  app.use(cors())

  app.get('/', async (req: Request, res: Response) => {
    console.log('HTTP: GET /', JSON.stringify(req.query))
    const {
      chainId,
      tokenIn: _tokenIn,
      tokenOut: _tokenOut,
      amount,
      gasPrice,
      to,
      preferSushi,
    } = querySchema.parse(req.query)
    const tokenManager = tokenManagers.get(chainId) as TokenManager
    const [tokenIn, tokenOut] = await Promise.all([
      _tokenIn === '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
        ? Native.onChain(chainId)
        : tokenManager.findToken(_tokenIn as Address),
      _tokenOut === '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
        ? Native.onChain(chainId)
        : tokenManager.findToken(_tokenOut as Address),
    ])
    if (!tokenIn || !tokenOut) {
      throw new Error('tokenIn or tokenOut is not supported')
    }
    const extractor = extractors.get(chainId) as Extractor
    const tokens = BASES_TO_CHECK_TRADES_AGAINST[chainId]
    const poolCodes = extractor.getPoolCodesForTokens(
      Array.from(new Set([tokenIn.wrapped, tokenOut.wrapped, ...tokens]))
    )
    // const poolCodes = await extractor.getPoolCodesForTokensAsync(
    //   Array.from(new Set([tokenIn.wrapped, tokenOut.wrapped, ...tokens])),
    //   200
    // )
    const poolCodesMap = new Map<string, PoolCode>()
    poolCodes.forEach((p) => poolCodesMap.set(p.pool.address, p))
    const nativeProvider = nativeProviders.get(chainId) as NativeWrapProvider
    nativeProvider.getCurrentPoolList().forEach((p) => poolCodesMap.set(p.pool.address, p))

    const bestRoute = Router[preferSushi ? 'findSpecialRoute' : 'findBestRoute'](
      poolCodesMap,
      chainId,
      tokenIn,
      BigNumber.from(amount.toString()),
      tokenOut,
      gasPrice ?? 30e9
    )
    return res.json({
      route: {
        status: bestRoute?.status,
        fromToken: bestRoute?.fromToken?.address === '' ? Native.onChain(chainId) : bestRoute?.fromToken,
        toToken: bestRoute?.toToken?.address === '' ? Native.onChain(chainId) : bestRoute?.toToken,
        primaryPrice: bestRoute?.primaryPrice,
        swapPrice: bestRoute?.swapPrice,
        amountIn: bestRoute?.amountIn,
        amountInBN: bestRoute?.amountInBN.toString(),
        amountOut: bestRoute?.amountOut,
        amountOutBN: bestRoute?.amountOutBN.toString(),
        priceImpact: bestRoute?.priceImpact,
        totalAmountOut: bestRoute?.totalAmountOut,
        totalAmountOutBN: bestRoute?.totalAmountOutBN.toString(),
        gasSpent: bestRoute?.gasSpent,
        legs: bestRoute?.legs,
      },
      args: to
        ? Router.routeProcessor3Params(
            poolCodesMap,
            bestRoute,
            tokenIn,
            tokenOut,
            to,
            ROUTE_PROCESSOR_3_ADDRESS[chainId],
            []
          )
        : undefined,
    })
  })

  // app.get('/get-pool-codes-for-tokens', (req: Request, res: Response) => {
  //   console.log('HTTP: GET /get-pool-codes-for-tokens', JSON.stringify(req.query))
  //   const { chainId } = querySchema.parse(req.query)
  //   const extractor = extractors.get(chainId) as Extractor
  //   const tokenManager = tokenManagers.get(chainId) as TokenManager
  //   const tokens = BASES_TO_CHECK_TRADES_AGAINST[chainId].concat(Array.from(tokenManager.tokens.values()).slice(0, 100))
  //   const poolCodes = extractor.getPoolCodesForTokens(tokens)
  //   return res.json(poolCodes)
  // })

  // app.get('/pool-codes', (req: Request, res: Response) => {
  //   console.log('HTTP: GET /pool-codes', JSON.stringify(req.query))
  //   const { chainId } = querySchema.parse(req.query)
  //   const extractor = extractors.get(chainId) as Extractor
  //   const poolCodes = extractor.getCurrentPoolCodes()
  //   res.json(poolCodes)
  // })

  app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}`)
  })
}
main()

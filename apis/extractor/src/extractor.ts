import 'dotenv/config'

import * as Sentry from '@sentry/node'
import { Extractor, type WarningLevel } from '@sushiswap/extractor'
import { PoolCode } from '@sushiswap/router'
import {
  ADDITIONAL_BASES,
  BASES_TO_CHECK_TRADES_AGAINST,
} from '@sushiswap/router-config'
// import cors from 'cors'
import express, { type Express, type Request, type Response } from 'express'
import { ChainId } from 'sushi/chain'
import {
  EXTRACTOR_SUPPORTED_CHAIN_IDS,
  isExtractorSupportedChainId,
  // EXTRACTOR_SUPPORTED_CHAIN_IDS,
  type ExtractorSupportedChainId,
} from 'sushi/config'
import { Native, Token } from 'sushi/currency'
import { Address, isAddress } from 'viem'
import z from 'zod'
import { EXTRACTOR_CONFIG } from './config'
import { RequestStatistics, ResponseRejectReason } from './requestStatistics'

const PORT = process.env['EXTRACTOR_PORT'] || 80

const SENTRY_DSN = process.env['SENTRY_DSN'] as string

const CHAIN_ID = Number(process.env['CHAIN_ID']) as ExtractorSupportedChainId

if (!CHAIN_ID) {
  throw new Error('CHAIN_ID env variable is not set')
}

const extractor = new Extractor({
  ...EXTRACTOR_CONFIG[CHAIN_ID],
  warningMessageHandler: (
    chain: ChainId | number | undefined,
    message: string,
    level: WarningLevel,
  ) => {
    Sentry.captureMessage(`${chain}: ${message}`, level)
  },
})

const requestStatistics = new RequestStatistics(60_000, 3_600_000)

async function main() {
  const app: Express = express()

  Sentry.init({
    enabled: false,
    dsn: SENTRY_DSN,
    integrations: [
      // enable HTTP calls tracing
      new Sentry.Integrations.Http({
        tracing: true,
      }),
      // enable Express.js middleware tracing
      new Sentry.Integrations.Express({
        app,
      }),
    ],
    // Performance Monitoring
    tracesSampleRate: 0.1, // Capture 10% of the transactions, reduce in production!,
  })

  await extractor.start(BASES_TO_CHECK_TRADES_AGAINST[CHAIN_ID])

  // app.use(
  //   cors({
  //     origin: /sushi\.com$/,
  //   }),
  // )

  // Trace incoming requests
  app.use(Sentry.Handlers.requestHandler())
  app.use(Sentry.Handlers.tracingHandler())

  app.get('/health', (_, res: Response) => {
    return res.status(200).send()
  })

  app.get('/pool-codes-for-token', async (req: Request, res: Response) => {
    res.setHeader('Cache-Control', 's-maxage=1, stale-while-revalidate=59')
    // console.log('HTTP: GET /get-pool-codes-for-tokens', JSON.stringify(req.query))
    const { chainId, address } = z
      .object({
        chainId: z.coerce
          .number()
          .int()
          .gte(0)
          .lte(2 ** 256)
          .default(ChainId.ETHEREUM)
          .refine((chainId) => isExtractorSupportedChainId(chainId), {
            message: 'ChainId not supported.',
          })
          .transform((chainId) => chainId as ExtractorSupportedChainId),
        address: z.coerce.string().refine(isAddress, {
          message: 'Address is not checksummed.',
        }),
      })
      .parse(req.query)
    const tokenManager = extractor.tokenManager
    const token = (await tokenManager.findToken(address)) as Token
    const poolCodesMap = new Map<string, PoolCode>()
    const common = BASES_TO_CHECK_TRADES_AGAINST?.[chainId] ?? []
    const additional = ADDITIONAL_BASES[chainId]?.[token.wrapped.address] ?? []
    const tokens = Array.from(
      new Set([token.wrapped, ...common, ...additional]),
    )
    const { prefetched: cachedPoolCodes, fetchingNumber } =
      extractor.getPoolCodesForTokensFull(tokens)
    cachedPoolCodes.forEach((p) => poolCodesMap.set(p.pool.address, p))
    if (fetchingNumber > 0) {
      const poolCodes = await extractor.getPoolCodesForTokensAsync(
        tokens,
        2_000,
      )
      poolCodes.forEach((p) => poolCodesMap.set(p.pool.address, p))
    }
    const { serialize } = await import('wagmi')
    return res.json(serialize(Array.from(poolCodesMap.values())))
  })

  app.get('/pool-codes', async (req: Request, res: Response) => {
    // console.log('HTTP: GET /pool-codes', JSON.stringify(req.query))
    res.setHeader('Cache-Control', 's-maxage=1, stale-while-revalidate=59')
    const { chainId } = z
      .object({
        chainId: z.coerce
          .number()
          .int()
          .gte(0)
          .lte(2 ** 256)
          .default(ChainId.ETHEREUM)
          .refine((chainId) => isExtractorSupportedChainId(chainId), {
            message: 'ChainId not supported.',
          })
          .transform((chainId) => chainId as ExtractorSupportedChainId),
      })
      .parse(req.query)
    if (chainId !== CHAIN_ID) {
      return res
        .status(400)
        .send(
          `Unsupported network, supported networks are: ${EXTRACTOR_SUPPORTED_CHAIN_IDS.join(
            ', ',
          )}`,
        )
    }
    const poolCodes = extractor.getCurrentPoolCodes()
    const { serialize } = await import('wagmi')
    return res.json(serialize(poolCodes))
  })

  app.get('/pool-codes-for-tokens', async (req: Request, res: Response) => {
    // console.log('HTTP: GET /pool-codes', JSON.stringify(req.query))
    res.setHeader('Cache-Control', 's-maxage=1, stale-while-revalidate=59')
    const {
      chainId,
      tokenIn: _tokenIn,
      tokenOut: _tokenOut,
    } = z
      .object({
        chainId: z.coerce
          .number()
          .int()
          .gte(0)
          .lte(2 ** 256)
          .default(ChainId.ETHEREUM)
          .refine((chainId) => isExtractorSupportedChainId(chainId), {
            message: 'ChainId not supported.',
          })
          .transform((chainId) => chainId as ExtractorSupportedChainId),

        tokenIn: z.string(),
        tokenOut: z.string(),
      })
      .parse(req.query)

    if (chainId !== CHAIN_ID) {
      return res
        .status(400)
        .send(
          `Unsupported network, supported networks are: ${EXTRACTOR_SUPPORTED_CHAIN_IDS.join(
            ', ',
          )}`,
        )
    }


    console.log({_tokenIn})
    let tokensAreKnown = true
    let tokenIn =
      _tokenIn === '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
        ? Native.onChain(chainId)
        : extractor.tokenManager.getKnownToken(_tokenIn as Address)
    let tokenOut =
      _tokenOut === '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
        ? Native.onChain(chainId)
        : extractor.tokenManager.getKnownToken(_tokenOut as Address)
    if (!tokenIn || !tokenOut) {
      // throw new Error('tokenIn or tokenOut is not supported')
      return res.status(400).send('tokenIn or tokenOut is not supported')
    }
    if (!tokenIn || !tokenOut) {
      // take unknown tokens async
      tokensAreKnown = false
      if (tokenIn === undefined && tokenOut !== undefined) {
        tokenIn = extractor.tokenManager.getKnownToken(tokenIn)
      } else if (tokenIn !== undefined && tokenOut === undefined) {
        tokenOut = extractor.tokenManager.getKnownToken(tokenOut)
      } else {
        // both tokens are unknown
        const tokens = await Promise.all([
          extractor.tokenManager.findToken(_tokenIn as Address),
          extractor.tokenManager.findToken(_tokenOut as Address),
        ])
        tokenIn = tokens[0]
        tokenOut = tokens[1]
      }
    }

    if (!tokenIn || !tokenOut) {
      requestStatistics.requestRejected(ResponseRejectReason.UNSUPPORTED_TOKENS)
      return res.status(400).send('tokenIn or tokenOut is not supported')
    }

    const common = BASES_TO_CHECK_TRADES_AGAINST?.[chainId] ?? []
    const additionalA = tokenIn
      ? ADDITIONAL_BASES[chainId]?.[tokenIn.wrapped.address] ?? []
      : []
    const additionalB = tokenOut
      ? ADDITIONAL_BASES[chainId]?.[tokenOut.wrapped.address] ?? []
      : []

    const tokens = [
      tokenIn.wrapped,
      tokenOut.wrapped,
      ...common,
      ...additionalA,
      ...additionalB,
    ]

    const poolCodes = tokensAreKnown
      ? extractor.getPoolCodesForTokens(tokens)
      : await extractor.getPoolCodesForTokensAsync(tokens, 2_000)
    const { serialize } = await import('wagmi')
    return res.json(serialize(poolCodes))
  })

  app.get('/token', async (req: Request, res: Response) => {
    // console.log('HTTP: GET /pool-codes', JSON.stringify(req.query))
    res.setHeader(
      'Cache-Control',
      's-maxage=9696969, stale-while-revalidate=9696969',
    ) // TODO: what's reasonable values here?
    const { chainId, address } = z
      .object({
        chainId: z.coerce
          .number()
          .int()
          .gte(0)
          .lte(2 ** 256)
          .default(ChainId.ETHEREUM)
          .refine((chainId) => isExtractorSupportedChainId(chainId), {
            message: 'ChainId not supported.',
          })
          .transform((chainId) => chainId as ExtractorSupportedChainId),
        address: z.coerce.string().transform((address) => address as Address),
        // .refine(isAddress, {
        // message: 'Address is not checksummed.',
        // }),
      })
      .parse(req.query)
    if (chainId !== CHAIN_ID) {
      return res
        .status(400)
        .send(
          `Unsupported network, supported networks are: ${EXTRACTOR_SUPPORTED_CHAIN_IDS.join(
            ', ',
          )}`,
        )
    }
    const token = await extractor.tokenManager.findToken(address)
    const { serialize } = await import('wagmi')
    return res.json(serialize(token))
  })

  // app.get('/debug-sentry', function mainHandler(req, res) {
  //   throw new Error('My first Sentry error!')
  // })

  // The error handler must be registered before any other error middleware and after all controllers
  app.use(Sentry.Handlers.errorHandler())

  app.listen(PORT, () => {
    console.log(`Extractor-${CHAIN_ID} listening on port ${PORT}`)
    requestStatistics.start()
  })
}

main()

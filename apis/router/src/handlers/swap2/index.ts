import { Logger, safeSerialize } from '@sushiswap/extractor'
import { Request, Response } from 'express'
import { ChainId } from 'sushi/chain'
import { ROUTE_PROCESSOR_4_ADDRESS, RouteProcessor4ChainId } from 'sushi/config'
import { Type } from 'sushi/currency'
import {
  NativeWrapProvider,
  Router,
  RouterLiquiditySource,
  makeAPI02Object,
} from 'sushi/router'
import { isAddressFast } from 'sushi/serializer'
import { MultiRoute } from 'sushi/tines'
import { Address } from 'viem'
import { ExtractorClient } from '../../ExtractorClient.js'
import swapRequestStatistics, {
  ResponseRejectReason,
} from '../../SwapRequestStatistics.js'
import {
  CHAIN_ID,
  MAX_TIME_WITHOUT_NETWORK_UPDATE,
  POOL_FETCH_TIMEOUT,
} from '../../config.js'
import { querySchema4_2 } from './schema.js'

const nativeProvider = new NativeWrapProvider(
  CHAIN_ID as ChainId,
  // @ts-ignore
  undefined, // actually it is not used
)

const delay = async (ms: number) => new Promise((res) => setTimeout(res, ms))

async function processUnknownToken(
  client: ExtractorClient,
  p: Promise<Type | undefined>,
) {
  const token = await p
  if (!token) return
  await Promise.any([client.fetchTokenPools(token), delay(POOL_FETCH_TIMEOUT)])
  return token
}

function handler(
  qSchema: typeof querySchema4_2,
  rpCode: typeof Router.routeProcessor4Params,
  rpAddress: Address,
) {
  return (client: ExtractorClient) => {
    return async (req: Request, res: Response) => {
      res.setHeader('Cache-Control', 's-maxage=2, stale-while-revalidate=28')
      let parsedData: any = undefined
      let bestRoute: MultiRoute | undefined = undefined
      try {
        const statistics = swapRequestStatistics.requestProcessingStart()

        let parsed: ReturnType<typeof querySchema4_2.safeParse> | undefined
        try {
          parsed = qSchema.safeParse(req.query)
        } catch (_e) {}
        if (!parsed || !parsed.success) {
          swapRequestStatistics.requestRejected(
            ResponseRejectReason.WRONG_INPUT_PARAMS,
          )
          return res.status(422).send('Request parameters parsing error')
        }
        const {
          tokenIn: _tokenIn,
          tokenOut: _tokenOut,
          amount,
          gasPrice,
          source,
          to,
          preferSushi,
          maxPriceImpact,
          maxSlippage: _maxSlippage,
        } = parsed.data
        parsedData = parsed.data
        const maxSlippage = _maxSlippage ?? 0.005 // default value

        if (!isAddressFast(_tokenIn))
          return res
            .status(422)
            .send(`Incorrect address for tokenIn: ${_tokenIn}`)
        if (!isAddressFast(_tokenOut))
          return res
            .status(422)
            .send(`Incorrect address for tokenOut: ${_tokenOut}`)
        if (to !== undefined && !isAddressFast(to))
          return res.status(422).send(`Incorrect address for 'to': ${to}`)
        if (amount <= 0)
          return res.status(422).send(`Amount must be positive: ${amount}`)

        if (
          client.lastUpdatedTimestamp + MAX_TIME_WITHOUT_NETWORK_UPDATE <
          Date.now()
        ) {
          console.log('no fresh data')
          swapRequestStatistics.requestRejected(
            ResponseRejectReason.NO_FRESH_DATA,
          )
          return res.status(500).send(`Network ${CHAIN_ID} data timeout`)
        }

        type T = Type | undefined | Promise<Type | undefined>
        let tokenIn: T = client.getToken(_tokenIn)
        let tokenOut: T = client.getToken(_tokenOut)

        let tokensAreKnown = true
        if (tokenIn instanceof Promise) {
          tokensAreKnown = false
          tokenIn = await processUnknownToken(client, tokenIn)
        }
        if (tokenOut instanceof Promise) {
          tokensAreKnown = false
          tokenOut = await processUnknownToken(client, tokenOut)
        }

        if (!tokenIn || !tokenOut) {
          swapRequestStatistics.requestRejected(
            ResponseRejectReason.UNSUPPORTED_TOKENS,
          )
          return res
            .status(422)
            .send(
              `Unknown token ${tokenIn === undefined ? _tokenIn : _tokenOut}`,
            )
        }

        const poolCodesMap = client.getKnownPoolsForTokens(tokenIn, tokenOut)
        nativeProvider
          .getCurrentPoolList()
          .forEach((p) => poolCodesMap.set(p.pool.uniqueID(), p))

        bestRoute = preferSushi
          ? Router.findSpecialRoute(
              poolCodesMap,
              CHAIN_ID as ChainId,
              tokenIn,
              amount,
              tokenOut,
              gasPrice ?? 30e9,
              maxPriceImpact === undefined ? undefined : maxPriceImpact * 100,
            )
          : Router.findBestRoute(
              poolCodesMap,
              CHAIN_ID as ChainId,
              tokenIn,
              amount,
              tokenOut,
              gasPrice ?? 30e9,
            )

        if (
          maxPriceImpact !== undefined &&
          (bestRoute.priceImpact ?? 0) > maxPriceImpact
        )
          bestRoute = Router.NoWayMultiRoute(tokenIn, tokenOut)

        const json = makeAPI02Object(
          bestRoute,
          to
            ? rpCode(
                poolCodesMap,
                bestRoute,
                tokenIn,
                tokenOut,
                to,
                rpAddress as Address,
                [],
                maxSlippage,
                source ?? RouterLiquiditySource.Sender,
              )
            : undefined,
          rpAddress as Address,
        )

        // we want to return { route, tx: { from, to, gas, gasPrice, value, input } }

        swapRequestStatistics.requestWasProcessed(statistics, tokensAreKnown)
        return res.json(json)
      } catch (e) {
        swapRequestStatistics.requestRejected(
          ResponseRejectReason.UNKNOWN_EXCEPTION,
        )

        const data: any = {}
        try {
          data.error = e instanceof Error ? e.stack?.split('\n') : `${e}`
          if (parsedData) data.params = parsedData
          if (bestRoute) data.route = makeAPI02Object(bestRoute, undefined, '')
        } catch (_e) {}
        Logger.error(CHAIN_ID, 'Routing crashed', safeSerialize(data), false)

        return res.status(500).send('Internal server error: Routing crashed')
        //throw e
      }
    }
  }
}

export const swapV4_2 = handler(
  querySchema4_2,
  Router.routeProcessor4Params,
  ROUTE_PROCESSOR_4_ADDRESS[CHAIN_ID as RouteProcessor4ChainId],
)

import path from 'path'
import { fileURLToPath } from 'url'
import {
  CurveWhitelistConfig,
  Extractor,
  FactoryV2,
  FactoryV3,
  LogFilterType,
  MultiCallAggregator,
  TokenManager,
} from '@sushiswap/extractor'
import { ChainId } from 'sushi/chain'
import {
  BASES_TO_CHECK_TRADES_AGAINST,
  SUSHISWAP_V2_FACTORY_ADDRESS,
  SUSHISWAP_V2_INIT_CODE_HASH,
  SUSHISWAP_V3_FACTORY_ADDRESS,
  SUSHISWAP_V3_INIT_CODE_HASH,
  SushiSwapV3ChainId,
  publicClientConfig,
} from 'sushi/config'
import { Native, Token } from 'sushi/currency'
import {
  LiquidityProviders,
  NativeWrapProvider,
  PoolCode,
  Router,
} from 'sushi/router'
import { RToken, RouteStatus, calcTokenPrices, getBigInt } from 'sushi/tines'
import { http, Address, Transport, createPublicClient } from 'viem'
import { Chain } from 'viem/chains'
import { createForkRouteProcessor5 } from '../src/index.js'
import { pancakeswapV3Factory } from './Extractor.test.js'
import RouteProcessor5 from './RouteProcessor5.sol/RouteProcessor5.json' assert {
  type: 'json',
}

export const TickLensContract = {
  [ChainId.ETHEREUM]: '0xbfd8137f7d1516d3ea5ca83523914859ec47f573' as Address,
  [ChainId.POLYGON]: '0xbfd8137f7d1516d3ea5ca83523914859ec47f573' as Address,
  [ChainId.ARBITRUM]: '0xbfd8137f7d1516d3ea5ca83523914859ec47f573' as Address,
  [ChainId.OPTIMISM]: '0xbfd8137f7d1516d3ea5ca83523914859ec47f573' as Address,
  [ChainId.CELO]: '0x5f115D9113F88e0a0Db1b5033D90D4a9690AcD3D' as Address,
  [ChainId.POLYGON_ZKEVM]:
    '0x0BE808376Ecb75a5CF9bB6D237d16cd37893d904' as Address,
  [ChainId.AVALANCHE]: '0xDdC1b5920723F774d2Ec2C3c9355251A20819776' as Address,
  [ChainId.BASE]: '0xF4d73326C13a4Fc5FD7A064217e12780e9Bd62c3' as Address,
  [ChainId.BSC]: '0xD9270014D396281579760619CCf4c3af0501A47C' as Address,
}

export const UniswapV2FactoryAddress: Record<number, string> = {
  [ChainId.ETHEREUM]: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
}
export function uniswapV2Factory(chain: ChainId): FactoryV2 {
  return {
    address: UniswapV2FactoryAddress[chain] as Address,
    provider: LiquidityProviders.UniswapV2,
    fee: 0.003,
    initCodeHash:
      '0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f',
  }
}

export function sushiswapV2Factory(chain: ChainId): FactoryV2 {
  return {
    address: SUSHISWAP_V2_FACTORY_ADDRESS[chain] as Address,
    provider: LiquidityProviders.SushiSwapV2,
    fee: 0.003,
    initCodeHash: SUSHISWAP_V2_INIT_CODE_HASH[chain],
  }
}

export const UniswapV3FactoryAddress: Record<number, string> = {
  [ChainId.ETHEREUM]: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
  [ChainId.POLYGON]: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
  [ChainId.ARBITRUM]: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
  [ChainId.OPTIMISM]: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
  [ChainId.BSC]: '0xdB1d10011AD0Ff90774D0C6Bb92e5C5c8b4461F7',
  [ChainId.CELO]: '0xAfE208a311B21f13EF87E33A90049fC17A7acDEc',
  [ChainId.BASE]: '0x33128a8fC17869897dcE68Ed026d694621f6FDfD',
}
export function uniswapV3Factory(chain: ChainId): FactoryV3 {
  return {
    address: UniswapV3FactoryAddress[chain] as Address,
    provider: LiquidityProviders.UniswapV3,
    initCodeHash: SUSHISWAP_V3_INIT_CODE_HASH[chain],
  }
}

export function sushiswapV3Factory(chainId: SushiSwapV3ChainId) {
  return {
    address: SUSHISWAP_V3_FACTORY_ADDRESS[chainId],
    provider: LiquidityProviders.SushiSwapV3,
    initCodeHash: SUSHISWAP_V3_INIT_CODE_HASH[chainId],
  } as const
}

const delay = async (ms: number) => new Promise((res) => setTimeout(res, ms))

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function startInfinitTest(args: {
  transport?: Transport
  providerURL: string
  chain: Chain
  forkBlockNumber?: bigint
  factoriesV2: FactoryV2[]
  factoriesV3: FactoryV3[]
  tickHelperContractV3: Address
  tickHelperContractAlgebra: Address
  curveConfig?: CurveWhitelistConfig
  cacheDir: string
  logDepth: number
  logType?: LogFilterType
  logging?: boolean
  maxCallsInOneBatch?: number
  account?: Address
  checkTokens?: Token[]
}) {
  const transport = args.transport ?? http(args.providerURL)
  const client = createPublicClient({
    chain: args.chain,
    transport: transport,
  })
  const chainId = client.chain?.id as ChainId

  const forkBlockNumber =
    args.forkBlockNumber ?? (await client.getBlockNumber())
  const fork = await createForkRouteProcessor5(
    args.providerURL,
    forkBlockNumber,
    chainId,
  )
  if (!fork.RouteProcessorAddress)
    throw new Error('RouteProcessor deploy failed')
  console.log(
    `RP4 deploy address: ${fork.RouteProcessorAddress} at block ${forkBlockNumber} chainId ${chainId}`,
  )

  const extractor = new Extractor({ ...args, client: fork.client })
  await extractor.start(
    BASES_TO_CHECK_TRADES_AGAINST[chainId].concat(args.checkTokens ?? []),
  )

  const nativeProvider = new NativeWrapProvider(chainId, fork.client)
  const tokenManager = new TokenManager(
    extractor.extractorV2?.multiCallAggregator ||
      (extractor.extractorV3?.multiCallAggregator as MultiCallAggregator) ||
      extractor.extractorCurve?.multiCallAggregator,
    __dirname,
    `tokens-${fork.client.chain?.id}`,
  )
  await tokenManager.addCachedTokens()

  const pools = extractor.getCurrentPoolCodes()
  const prices = calcTokenPrices(
    pools.concat(nativeProvider.getCurrentPoolList()).map((p) => p.pool),
    Native.onChain(chainId) as unknown as RToken,
  )
  const tokens = Array.from(prices.keys()).map((t) => {
    if (
      t.address === '' ||
      t.address === undefined ||
      t.address === '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
    )
      return Native.onChain(t.chainId as number)
    else
      return new Token({
        chainId: t.chainId as number,
        address: t.address,
        name: t.name,
        symbol: t.symbol,
        decimals: t.decimals,
      })
  })

  for (let i = 0; i < tokens.length; ++i) {
    await delay(1000)
    const pools = extractor.getCurrentPoolCodes()
    const poolMap = new Map<string, PoolCode>()
    pools.forEach((p) => poolMap.set(p.pool.uniqueID(), p))
    nativeProvider
      .getCurrentPoolList()
      .forEach((p) => poolMap.set(p.pool.uniqueID(), p))
    const fromToken = Native.onChain(chainId)
    const toToken = tokens[i]
    const route = Router.findBestRoute(
      poolMap,
      chainId,
      fromToken,
      getBigInt(1e18),
      toToken,
      30e9,
    )

    if (route.status === RouteStatus.NoWay) {
      console.log(
        `Routing: ${fromToken.symbol} => ${toToken.symbol} ${route.status}`,
      )
      continue
    }
    const rpParams = Router.routeProcessor5Params(
      poolMap,
      route,
      fromToken,
      toToken,
      fork.RouteProcessorAddress,
      fork.RouteProcessorAddress,
    )
    if (rpParams === undefined) {
      console.log(
        `Routing: ${fromToken.symbol} => ${toToken.symbol} ${route.status} ROUTE CREATION FAILED !!!`,
      )
      continue
    }

    // console.log(
    //   'ROUTE:',
    //   route.legs.map(
    //     (l) =>
    //       `${l.tokenFrom.symbol} -> ${l.tokenTo.symbol}  ${l.poolAddress}  ${l.assumedAmountIn} -> ${l.assumedAmountOut}`
    //   )
    // )

    try {
      const { result: amountOutReal } = (await fork.client.simulateContract({
        address: fork.RouteProcessorAddress,
        abi: RouteProcessor5.abi,
        functionName: 'processRoute',
        args: [
          rpParams.tokenIn as Address,
          BigInt(rpParams.amountIn.toString()),
          rpParams.tokenOut as Address,
          0n,
          rpParams.to as Address,
          rpParams.routeCode as Address, // !!!!
        ],
        value: BigInt(rpParams.value?.toString() as string),
        account: args.account,
      })) as { result: bigint }
      const amountOutExp = BigInt(route.amountOutBI.toString())
      const diff =
        amountOutExp === 0n
          ? amountOutReal - amountOutExp
          : Number(amountOutReal - amountOutExp) / route.amountOut
      console.log(
        `Routing: ${fromToken.symbol} => ${toToken.symbol} ${
          route.legs.length
        } pools diff = ${diff > 0 ? '+' : ''}${diff} `,
      )
      if (Math.abs(Number(diff)) > 0.001)
        console.log('Routing: TOO BIG DIFFERENCE !!!!!!!!!!!!!!!!!!!!!')
    } catch (e) {
      console.log(`Routing failed. No connection ? ${e}`)
    }
  }
}

const drpcId = process.env['DRPC_ID'] || process.env['NEXT_PUBLIC_DRPC_ID']

it.skip('Extractor BSC infinite work test', async () => {
  await startInfinitTest({
    transport: publicClientConfig[ChainId.BSC].transport,
    chain: publicClientConfig[ChainId.BSC].chain as Chain,
    factoriesV2: [],
    factoriesV3: [pancakeswapV3Factory(ChainId.BSC)],
    tickHelperContractV3: TickLensContract[ChainId.BSC],
    tickHelperContractAlgebra: '' as Address,
    cacheDir: './cache',
    logDepth: 300,
    logging: true,
    providerURL: `https://rpc.orbs.network/42161/c0cc4a53105a582993deb4f9efc9a368f3f053a34384fb379567e01bfb9aace47`,
  })
})

it.skip('Extractor Ethereum infinite work test', async () => {
  await startInfinitTest({
    transport: publicClientConfig[ChainId.ETHEREUM].transport,
    chain: publicClientConfig[ChainId.ETHEREUM].chain as Chain,
    factoriesV2: [],
    factoriesV3: [],
    tickHelperContractV3: TickLensContract[ChainId.ETHEREUM],
    tickHelperContractAlgebra: '' as Address,
    curveConfig: {
      minPoolLiquidityLimitUSD: 1000,
    },
    cacheDir: './cache',
    logDepth: 300,
    logging: true,
    providerURL: `https://eth-mainnet.alchemyapi.io/v2/${process.env.ALCHEMY_ID}`,
    forkBlockNumber: 20139500n,
  })
})

/* eslint-disable turbo/no-undeclared-env-vars */
import { isAddress } from '@ethersproject/address'
import { BigNumber } from '@ethersproject/bignumber'
import { liquidityAbi, slot0Abi, totalsAbi } from '@sushiswap/abi'
import { bentoBoxV1Address, BentoBoxV1ChainId, isBentoBoxV1ChainId } from '@sushiswap/bentobox'
import type { ChainId } from '@sushiswap/chain'
import { Prisma, PrismaClient, Token } from '@sushiswap/database'
import { calcTokenPrices, CLRPool, ConstantProductRPool, Rebase, RPool, StableSwapRPool } from '@sushiswap/tines'
import { Address, readContracts } from '@wagmi/core'
import { performance } from 'perf_hooks'

import { PoolType, Price, ProtocolName, ProtocolVersion } from '../config.js'
import { getConcentratedLiquidityPoolReserves, getConstantProductPoolReserves, getStablePoolReserves } from '../lib/reserves.js'


const CURRENT_SUPPORTED_VERSIONS = [ProtocolVersion.V2, ProtocolVersion.V3, ProtocolVersion.LEGACY, ProtocolVersion.TRIDENT]

export async function prices(chainId: ChainId, base: string, price: Price, minimumLiquidity = 500000000) {
  const client = new PrismaClient()
  try {
    if (!Object.values(Price).includes(price)) {
      throw new Error(`Price (${price}) not supported, supported price types: ${Object.values(Price).join(',')}`)
    }
    if (!isAddress(base)) {
      throw new Error(`${base} is not a valid address`)
    }

    const startTime = performance.now()

    console.log(`Arguments: CHAIN_ID: ${chainId}, BASE: ${base}, PRICE: ${price}`)

    const baseToken = await getBaseToken(client, chainId, base)
    const pools = await getPools(client, chainId)

    const { rPools, tokens } = await transform(chainId, pools)
    const tokensToUpdate = calculatePrices(rPools, minimumLiquidity, baseToken, tokens)
    await updateTokenPrices(client, price, tokensToUpdate)

    const endTime = performance.now()
    console.log(`COMPLETED (${((endTime - startTime) / 1000).toFixed(1)}s). `)
  } catch (e) {
    console.error(e)
    await client.$disconnect()
  } finally {
    await client.$disconnect()
  }
}

async function getBaseToken(client: PrismaClient, chainId: ChainId, address: string) {
  const baseToken = await client.token.findFirst({
    select: {
      address: true,
      name: true,
      symbol: true,
      decimals: true,
    },
    where: {
      chainId,
      address: address.toLowerCase(),
    },
  })

  if (!baseToken) throw new Error(`${baseToken} not found in database, check the address and chainId.`)
  return baseToken
}

async function getPools(client: PrismaClient, chainId: ChainId) {
  const startTime = performance.now()

  const batchSize = 2500
  let cursor = null
  const results = []
  let totalCount = 0
  do {
    const requestStartTime = performance.now()
    let result = []
    if (!cursor) {
      result = await getPoolsByPagination(client, chainId, batchSize)
    } else {
      result = await getPoolsByPagination(client, chainId, batchSize, 1, { id: cursor })
    }

    cursor = result.length == batchSize ? result[result.length - 1]?.id : null
    totalCount += result.length
    results.push(result)
    const requestEndTime = performance.now()
    console.log(
      `Fetched a batch of pools with ${result.length} (${((requestEndTime - requestStartTime) / 1000).toFixed(
        1
      )}s). cursor: ${cursor}, total: ${totalCount}`
    )
  } while (cursor != null)
  const endTime = performance.now()
  const flatResult = results.flat()

  console.log(`Fetched ${flatResult.length} pools (${((endTime - startTime) / 1000).toFixed(1)}s). `)
  return flatResult
}

async function getPoolsByPagination(
  client: PrismaClient,
  chainId: ChainId,
  take: number,
  skip?: number,
  cursor?: Prisma.PoolWhereUniqueInput
): Promise<Pool[]> {
  return client.pool.findMany({
    take,
    skip,
    cursor,
    select: {
      id: true,
      address: true,
      chainId: true,
      token0: true,
      token1: true,
      swapFee: true,
      type: true,
    },
    where: {
      OR: [
        {
          isWhitelisted: true,
          chainId,
          type: { in: [PoolType.CONSTANT_PRODUCT_POOL, PoolType.STABLE_POOL, PoolType.CONCENTRATED_LIQUIDITY_POOL] },
          version: {
            in: CURRENT_SUPPORTED_VERSIONS,
          },
        },
        {
          chainId,
          protocol: ProtocolName.SUSHISWAP,
          type: { in: [PoolType.CONSTANT_PRODUCT_POOL, PoolType.STABLE_POOL] },
          version: {
            in: [ProtocolVersion.V2, ProtocolVersion.LEGACY, ProtocolVersion.TRIDENT],
          },
        },
      ],
    },
  })
}

async function transform(chainId: ChainId, pools: Pool[]) {
  const tokens: Map<string, Token> = new Map()
  const stablePools = pools.filter((pool) => pool.type === PoolType.STABLE_POOL)
  const rebases = isBentoBoxV1ChainId(chainId) ? await fetchRebases(stablePools, chainId) : undefined
  
  const constantProductPoolIds = pools.filter((p) => p.type === PoolType.CONSTANT_PRODUCT_POOL).map((p) => p.id)
  const stablePoolIds = pools.filter((p) => p.type === PoolType.STABLE_POOL).map((p) => p.id)
  const concentratedLiquidityPools = pools.filter((p) => p.type === PoolType.CONCENTRATED_LIQUIDITY_POOL)

  const [constantProductReserves, stableReserves, concentratedLiquidityReserves, v3Info] = await Promise.all([
    getConstantProductPoolReserves(constantProductPoolIds),
    getStablePoolReserves(stablePoolIds),
    getConcentratedLiquidityPoolReserves(concentratedLiquidityPools),
    fetchV3Info(concentratedLiquidityPools, chainId)
  ])
  const poolsWithReserves = new Map([...constantProductReserves, ...stableReserves, ...concentratedLiquidityReserves])

  const rPools: RPool[] = []
  pools.forEach((pool) => {
    const reserves = poolsWithReserves.get(pool.id)
    if (!reserves) return
    const token0 = {
      address: pool.token0.address,
      name: pool.token0.name,
      symbol: pool.token0.symbol,
    }
    const token1 = {
      address: pool.token1.address,
      name: pool.token1.name,
      symbol: pool.token1.symbol,
    }
    if (!tokens.has(token0.address)) tokens.set(token0.address, pool.token0)
    if (!tokens.has(token1.address)) tokens.set(token1.address, pool.token1)
    if (pool.type === PoolType.CONSTANT_PRODUCT_POOL) {
      rPools.push(
        new ConstantProductRPool(
          pool.address,
          token0,
          token1,
          pool.swapFee,
          reserves.reserve0,
          reserves.reserve1,
        )
      )
    } else if (pool.type === PoolType.STABLE_POOL) {
      const total0 = rebases?.get(token0.address)
      const total1 = rebases?.get(token1.address)
      if (total0 && total1) {
        rPools.push(
          new StableSwapRPool(
            pool.address,
            token0,
            token1,
            pool.swapFee,
            reserves.reserve0,
            reserves.reserve1,
            pool.token0.decimals,
            pool.token1.decimals,
            total0,
            total1
          )
        )
      }
    } else if (pool.type === PoolType.CONCENTRATED_LIQUIDITY_POOL) {
        const v3 = v3Info.get(pool.address)
        if (v3) {
          rPools.push(
            new CLRPool(
              pool.address,
              token0,
              token1,
              pool.swapFee,
              12,
              reserves.reserve0,
              reserves.reserve1,
              v3.liquidity,
              v3.sqrtPriceX96,
              v3.tick,
              []
            )
          )
        }
    }
  })
  console.log(`Transformed ${rPools.length} pools and ${tokens.size} tokens`)
  return { rPools, tokens }
}

async function fetchRebases(pools: Pool[], chainId: BentoBoxV1ChainId) {
  const sortedTokens = poolsToUniqueTokens(pools)

  const totals = await readContracts({
    allowFailure: true,
    contracts: sortedTokens.map(
      (t) =>
        ({
          args: [t.address as Address],
          address: bentoBoxV1Address[chainId],
          chainId: chainId,
          abi: totalsAbi,
          functionName: 'totals',
        } as const)
    ),
  })

  const rebases: Map<string, Rebase> = new Map()
  sortedTokens.forEach((t, i) => {
    const total = totals[i]
    if (total === undefined || total === null) return
    rebases.set(t.address, total)
  })
  return rebases
}


async function fetchV3Info(pools: Pool[], chainId: ChainId) {

  const [slot0, liquidity] = await Promise.all([
    readContracts({
    allowFailure: true,
    contracts: pools.map((pool) => ({
      address: pool.address as Address,
      chainId,
      abi: slot0Abi,
      functionName: 'slot0',
    } as const))
    }),
  readContracts({
    allowFailure: true,
    contracts: pools.map(
      (p) =>
        ({
          address: p.address as Address,
          chainId: chainId,
          abi: liquidityAbi,
          functionName: 'liquidity',
        } as const)
    )
  }),
 
])
  const poolInfo: Map<string, V3PoolInfo> = new Map()
  pools.forEach((pool, i) => {
    const _slot0 = slot0[i]
    const _liquidity = liquidity[i]
    if (_slot0 && _liquidity) {
      poolInfo.set(pool.address, {
        address: pool.address,
        liquidity: _liquidity,
        sqrtPriceX96: _slot0.sqrtPriceX96,
        tick: _slot0.tick,
        observationIndex: _slot0.observationIndex,
        observationCardinality: _slot0.observationCardinality,
        observationCardinalityNext: _slot0.observationCardinalityNext,
        feeProtocol: _slot0.feeProtocol,
        unlocked: _slot0.unlocked,
      })
    }
  })

  return poolInfo
}

function poolsToUniqueTokens(pools: Pool[]){
  const tokenMap = new Map<string, Token>()
  pools.forEach((pool) => {
    tokenMap.set(pool.token0.address, pool.token0)
    tokenMap.set(pool.token1.address, pool.token1)
  })
  const tokensDedup = Array.from(tokenMap.values())
  const tok0: [string, Token][] = tokensDedup.map((t) => [
    t.address.toLocaleLowerCase().substring(2).padStart(40, '0'),
    t,
  ])
  return tok0.sort((a, b) => (b[0] > a[0] ? -1 : 1)).map(([, t]) => t)
}


function calculatePrices(
  pools: RPool[],
  minimumLiquidity: number | undefined,
  baseToken: { symbol: string; address: string; name: string; decimals: number },
  tokens: Map<string, Token>
) {
  const startTime = performance.now()
  const results = calcTokenPrices(pools, baseToken, minimumLiquidity)
  const endTime = performance.now()
  console.log(`calcTokenPrices() found ${results.size} prices (${((endTime - startTime) / 1000).toFixed(1)}s). `)

  const tokensWithPrices = []

  for (const [rToken, value] of results.entries()) {
    const token = tokens.get(rToken.address)
    if (!token) {
      console.log(`Token not found: ${rToken.symbol}~${rToken.address}~${value}`)
      continue
    }
    if (value === 0) {
      console.log(`Price null: ${rToken.symbol}~${rToken.address}~${value}`)
    }

    const price = Number((value / Math.pow(10, baseToken.decimals - token.decimals)).toFixed(12))
    if (price > Number.MAX_SAFE_INTEGER) continue
    // console.log(`${token.symbol}~${token.address}~${price}`)
    tokensWithPrices.push({ id: token.id, price })
  }

  return tokensWithPrices
}

async function updateTokenPrices(client: PrismaClient, price: Price, tokens: { id: string; price: number }[]) {
  const startTime = performance.now()
  const batchSize = 250
  let updatedCount = 0

  for (let i = 0; i < tokens.length; i += batchSize) {
    const batch = tokens.slice(i, i + batchSize)
    const requests = batch.map((token) => {
      const data = price === Price.USD ? { derivedUSD: token.price } : { derivedETH: token.price }
      return client.token.update({
        select: { id: true }, // select only the `id` field, otherwise it returns everything and we don't use the data after updating.
        where: { id: token.id },
        data,
      })
    })
    const responses = await Promise.all(requests)
    console.log(`BATCH: Updated ${responses.length} prices.`)
    updatedCount += responses.length
  }
  const endTime = performance.now()
  console.log(`Updated ${updatedCount} prices (${((endTime - startTime) / 1000).toFixed(1)}s). `)
}

interface Pool {
  id: string
  address: string
  chainId: number
  type: string
  token0: Token
  token1: Token
  swapFee: number
}

interface V3PoolInfo {
  address: string
  liquidity: BigNumber
  sqrtPriceX96: BigNumber
  tick: number
  observationIndex: number
  observationCardinality: number
  observationCardinalityNext: number
  feeProtocol: number
  unlocked: boolean
}
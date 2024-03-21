import 'dotenv/config'

import { BlastPointsClient } from './lib/BlastPointsClient'
import {
  BLOCKS_PER_SECOND,
  MAX_TRANSFER_DECIMALS,
  MINIMUM_TRANSFER_SIZE,
  USDB,
  WETH,
} from './lib/constants'
import {
  BLOCKS_SUBGRAPH_NAME,
  SUBGRAPH_HOST,
  SUSHISWAP_V3_SUBGRAPH_NAME,
} from './lib/graph'
import { ChainId, Transfer } from './lib/types'
import { getEligibleV2Pairs, getV2LiquidityOverBlocks } from './v2'
import {
  getEligbleV3Pools,
  getSteerLiquidityOverBlocks,
  getV3LiquidityOverBlocks,
  steerSDK,
} from './v3'
import { PairsQuery, V3PoolsQuery, getBuiltGraphSDK } from '.graphclient'

const OPERATOR_PRIVATE_KEY = process.env.POINTS_OPERATOR_PRIVATE_KEY

const blocksSDK = getBuiltGraphSDK({
  host: SUBGRAPH_HOST[ChainId.BLAST],
  name: BLOCKS_SUBGRAPH_NAME[ChainId.BLAST],
})

function selectBlocks(startBlock: number, endBlock: number) {
  const approxInterval = 12 * 60 * 60 * BLOCKS_PER_SECOND // 12 hours
  const numBlocks = Math.ceil((endBlock - startBlock) / approxInterval)
  const interval = (endBlock - startBlock) / numBlocks
  const remainder = (endBlock - startBlock) % numBlocks

  const blocks = Array.from(
    { length: numBlocks },
    (_, i) => startBlock + Math.ceil(i * interval),
  )
  if (remainder) blocks.push(endBlock)

  return blocks
}

async function distributeV3Pools() {
  const pools = await getEligbleV3Pools()

  const steerPools = steerSDK
    ? await steerSDK
        .SteerVaults()
        .then((data) =>
          Array.from(new Set(data.vaults.map((vault) => vault.pool))),
        )
        .catch((e) => {
          console.log(e)
          return []
        })
    : []

  for (const pool of pools) {
    const isSteerPool = steerPools.includes(pool.id)

    const client = await BlastPointsClient.initialize(
      pool.id,
      OPERATOR_PRIVATE_KEY as `0x${string}`,
    )

    const balances = await client.getBalances()
    const availablePoints = +balances.balancesByPointType.LIQUIDITY.available
    if (availablePoints < MINIMUM_TRANSFER_SIZE) {
      console.log(
        `skipping V2Pair ${pool.id} does not meet the minimum points requirement...`,
      )
      continue
    }

    const transfers = await client.getBatches()

    console.log('transfers', transfers)

    const startBlock = transfers.length
      ? +transfers[0].id
      : +pool.createdAtBlockNumber

    const currentBlock = (await blocksSDK.CurrentBlock())._meta?.block.number
    if (!currentBlock) {
      console.log('Failed to fetch current block')
      continue
    }

    const blocks = selectBlocks(startBlock, currentBlock)

    const steerLiquidity = isSteerPool
      ? await getSteerLiquidityOverBlocks(blocks, pool)
      : undefined
    const v3Liquidity = await getV3LiquidityOverBlocks(blocks, pool)

    const combinedLiquidity = v3Liquidity
    if (isSteerPool) {
      Object.entries(steerLiquidity!.users).forEach(([key, value]) => {
        combinedLiquidity.users[key] = {
          reserve0:
            (combinedLiquidity.users[key]?.reserve0 ?? 0) + value.reserve0,
          reserve1:
            (combinedLiquidity.users[key]?.reserve1 ?? 0) + value.reserve1,
        }
      })
      combinedLiquidity.total = {
        reserve0:
          combinedLiquidity.total.reserve0 + steerLiquidity!.total.reserve0,
        reserve1:
          combinedLiquidity.total.reserve1 + steerLiquidity!.total.reserve1,
      }
    }

    console.log(steerLiquidity)
    console.log(v3Liquidity)

    const batchTransfers: Transfer[] = Object.entries(
      combinedLiquidity.users,
    ).map(([key, value]) => {
      const relativePoints =
        [USDB, WETH].includes(pool.token0.id) &&
        [USDB, WETH].includes(pool.token1.id)
          ? (value.reserve0 + value.reserve1) /
            (combinedLiquidity.total.reserve0 +
              combinedLiquidity.total.reserve1)
          : [USDB, WETH].includes(pool.token0.id)
            ? value.reserve0 / combinedLiquidity.total.reserve0
            : value.reserve1 / combinedLiquidity.total.reserve1

      return {
        toAddress: key,
        points: (availablePoints * relativePoints).toFixed(
          MAX_TRANSFER_DECIMALS,
        ),
      }
    })

    console.log('availablePoints', availablePoints)
    console.log('batchTransfers', batchTransfers)

    // const response = await client.sendBatch(
    //   {
    //     pointType: 'LIQUIDITY',
    //     secondsToFinalize: 3600,
    //     transfers: batchTransfers,
    //   },
    //   currentBlock.toString(),
    // )

    // console.log('response', response)
  }
}

async function distributeV2Pairs() {
  const pairs = await getEligibleV2Pairs()

  for (const pair of pairs) {
    const client = await BlastPointsClient.initialize(
      pair.id,
      OPERATOR_PRIVATE_KEY as `0x${string}`,
    )

    console.log(pair.id)

    const balances = await client.getBalances()

    const availablePoints = +balances.balancesByPointType.LIQUIDITY.available
    if (availablePoints < MINIMUM_TRANSFER_SIZE) {
      console.log(
        `skipping V2Pair ${pair.id} does not meet the minimum points requirement...`,
      )
      continue
    }

    const transfers = await client.getBatches()

    console.log('transfers', transfers)

    const startBlock = transfers.length
      ? +transfers[0].id
      : +pair.createdAtBlock

    const currentBlock = (await blocksSDK.CurrentBlock())._meta?.block.number
    if (!currentBlock) {
      console.log('Failed to fetch current block')
      continue
    }

    const blocks = selectBlocks(startBlock, currentBlock)

    const liquidityOverBlocks = await getV2LiquidityOverBlocks(blocks, pair)

    const batchTransfers: Transfer[] = Object.entries(
      liquidityOverBlocks.users,
    ).map(([key, value]) => {
      const relativePoints =
        [USDB, WETH].includes(pair.token0.id) &&
        [USDB, WETH].includes(pair.token1.id)
          ? (value.reserve0 + value.reserve1) /
            (liquidityOverBlocks.total.reserve0 +
              liquidityOverBlocks.total.reserve1)
          : [USDB, WETH].includes(pair.token0.id)
            ? value.reserve0 / liquidityOverBlocks.total.reserve0
            : value.reserve1 / liquidityOverBlocks.total.reserve1

      return {
        toAddress: key,
        points: (availablePoints * relativePoints).toFixed(
          MAX_TRANSFER_DECIMALS,
        ),
      }
    })

    console.log('availablePoints', availablePoints)
    console.log('batchTransfers', batchTransfers)

    // const response = await client.sendBatch(
    //   {
    //     pointType: 'LIQUIDITY',
    //     secondsToFinalize: 3600,
    //     transfers: batchTransfers,
    //   },
    //   currentBlock.toString(),
    // )

    // console.log('response', response)
  }
}

async function main() {
  if (!OPERATOR_PRIVATE_KEY) throw new Error('OPERATOR_PRIVATE_KEY is not set')

  // await distributeV2Pairs()
  await distributeV3Pools()
}

main()

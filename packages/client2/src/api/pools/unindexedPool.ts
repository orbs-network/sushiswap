import { Protocol } from '@sushiswap/database2'
import { config } from '@sushiswap/viem-config'
import {
  erc20Abi,
  uniswapV2PairAbi,
  v3baseAbi,
} from 'sushi/abi'
import { type Address, type PublicClient, createPublicClient } from 'viem'

import { type getPoolFromDB } from './pool'

interface GetPoolArgs {
  client: PublicClient
  address: Address
  protocol?: Protocol
}

interface Pool {
  tokens: Address[]
  liquidity: string
  swapFee: number
  twapEnabled: boolean
  protocol: Protocol
}

async function getTokenInfo({ client, address }: GetPoolArgs) {
  const [name, symbol, decimals] = await client.multicall({
    allowFailure: false,
    contracts: [
      {
        address: address,
        abi: erc20Abi,
        functionName: 'name',
      },
      {
        address: address,
        abi: erc20Abi,
        functionName: 'symbol',
      },
      {
        address: address,
        abi: erc20Abi,
        functionName: 'decimals',
      },
      {
        address: address,
        abi: erc20Abi,
        functionName: 'name',
      },
    ],
  })

  return { address, name, symbol, decimals }
}

async function getV2Pool({ client, address }: GetPoolArgs): Promise<Pool> {
  const [token0, token1, totalSupply] = await client.multicall({
    allowFailure: false,
    contracts: [
      {
        address: address,
        abi: uniswapV2PairAbi,
        functionName: 'token0',
      },
      {
        address: address,
        abi: uniswapV2PairAbi,
        functionName: 'token1',
      },
      {
        address: address,
        abi: uniswapV2PairAbi,
        functionName: 'totalSupply',
      },
    ],
  })

  return {
    tokens: [token0, token1],
    liquidity: totalSupply.toString(),
    swapFee: 0.003,
    twapEnabled: true,
    protocol: Protocol.SUSHISWAP_V2,
  }
}

async function getV3Pool({ client, address }: GetPoolArgs): Promise<Pool> {
  const [token0, token1, liquidity, fee] = await client.multicall({
    allowFailure: false,
    contracts: [
      {
        address: address,
        abi: v3baseAbi,
        functionName: 'token0',
      },
      {
        address: address,
        abi: v3baseAbi,
        functionName: 'token1',
      },
      {
        address: address,
        abi: v3baseAbi,
        functionName: 'liquidity',
      },
      {
        address: address,
        abi: v3baseAbi,
        functionName: 'fee',
      },
    ],
  })
  return {
    tokens: [token0, token1],
    liquidity: liquidity.toString(),
    // 500 is 0.05%. divide it by 1M to get the 0.0005 format
    swapFee: fee / 1_000_000,
    twapEnabled: true,
    protocol: Protocol.SUSHISWAP_V3,
  }
}

// Thought ReturnType would be enough, needed to wrap it to make TS happy
export async function getUnindexedPool(
  poolId: string,
): Promise<Awaited<ReturnType<typeof getPoolFromDB>>> {
  // TODO: Use validator
  const [chainId, address] = [
    Number(poolId.split(':')[0]),
    poolId.split(':')[1],
  ] as [number, Address]
  if (!chainId || !address) throw new Error('Invalid pool id.')

  const cfg = config[chainId as keyof typeof config]
  if (!cfg) throw new Error('Invalid chain id.')

  const client = createPublicClient({
    chain: cfg.chain,
    transport: cfg.transport,
  })

  let lpTokenName
  try {
    const { name } = await getTokenInfo({ client, address: address })
    lpTokenName = name
  } catch (_e) {
    lpTokenName = 'V3'
  }

  let poolFetcher: (args: GetPoolArgs) => Promise<Pool>
  switch (lpTokenName) {
    case 'SushiSwap LP Token':
      poolFetcher = getV2Pool
      break
    default:
      poolFetcher = getV3Pool
  }

  const pool = await poolFetcher({ client, address })

  const tokens = await Promise.all(
    pool.tokens.map((token) => getTokenInfo({ client, address: token })),
  )

  const poolName = tokens.map(({ symbol }) => symbol).join('-')

  const [token0, token1] = tokens as [
    typeof tokens[number],
    typeof tokens[number],
  ]

  return {
    id: poolId,
    address,
    name: poolName,
    chainId: BigInt(chainId),
    token0: {
      id: `${chainId}:${token0.address.toLowerCase()}`,
      address: token0.address.toLowerCase(),
      symbol: token0.symbol,
      name: token0.name,
      decimals: token0.decimals,
    },
    token1: {
      id: `${chainId}:${token1.address.toLowerCase()}`,
      address: token1.address.toLowerCase(),
      symbol: token1.symbol,
      name: token1.name,
      decimals: token1.decimals,
    },
    // hasEnabledSteerVault: false,
    // hadEnabledSteerVault: false,
    // steerVaults: [],
    liquidityUSD: 0,
    volumeUSD: 0,
    feesUSD: '0',
    liquidityUSDChange1h: 0,
    liquidityUSDChange1d: 0,
    liquidityUSDChange1w: 0,
    liquidityUSDChange1m: 0,
    feeApr1h: 0,
    feeApr1d: 0,
    feeApr1w: 0,
    feeApr1m: 0,
    totalApr1h: 0,
    totalApr1d: 0,
    totalApr1w: 0,
    totalApr1m: 0,
    // incentiveApr: 0,
    // isIncentivized: false,
    // wasIncentivized: false,
    volumeUSD1h: 0,
    volumeUSD1d: 0,
    volumeUSD1w: 0,
    volumeUSD1m: 0,
    volumeUSDChange1h: 0,
    volumeUSDChange1d: 0,
    volumeUSDChange1w: 0,
    volumeUSDChange1m: 0,
    feeUSD1h: 0,
    feeUSD1d: 0,
    feeUSD1w: 0,
    feeUSD1m: 0,
    feeUSDChange1h: 0,
    feeUSDChange1d: 0,
    feeUSDChange1w: 0,
    feeUSDChange1m: 0,
    // isBlacklisted: false,
    // incentives: [],
    ...pool,
  } as Awaited<ReturnType<typeof getPoolFromDB>>
}

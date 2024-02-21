import { Prisma } from '@sushiswap/database2'

export const PoolSelect = {
  id: true,
  address: true,
  name: true,
  chainId: true,
  protocol: true,
  swapFee: true,
  // twapEnabled: true,
  liquidity: true,
  liquidityUSD: true,
  volumeUSD: true,
  feeApr1h: true,
  feeApr1d: true,
  feeApr1w: true,
  feeApr1m: true,
  totalApr1h: true,
  totalApr1d: true,
  totalApr1w: true,
  totalApr1m: true,
  // incentiveApr: true,
  // isIncentivized: true,
  // wasIncentivized: true,
  feeUSD1h: true,
  feeUSD1d: true,
  feeUSD1w: true,
  feeUSD1m: true,
  feeUSDChange1h: true,
  feeUSDChange1d: true,
  feeUSDChange1w: true,
  feeUSDChange1m: true,
  volumeUSD1h: true,
  volumeUSD1d: true,
  volumeUSD1w: true,
  volumeUSD1m: true,
  volumeUSDChange1h: true,
  volumeUSDChange1d: true,
  volumeUSDChange1w: true,
  volumeUSDChange1m: true,
  liquidityUSDChange1h: true,
  liquidityUSDChange1d: true,
  liquidityUSDChange1w: true,
  liquidityUSDChange1m: true,
  // isBlacklisted: true,
  token0: {
    select: {
      id: true,
      address: true,
      name: true,
      symbol: true,
      decimals: true,
    },
  },
  token1: {
    select: {
      id: true,
      address: true,
      name: true,
      symbol: true,
      decimals: true,
    },
  },
  // incentives: {
  //   select: {
  //     id: true,
  //     pid: true,
  //     chainId: true,
  //     chefType: true,
  //     apr: true,
  //     rewarderAddress: true,
  //     rewarderType: true,
  //     rewardPerDay: true,
  //     rewardToken: {
  //       select: {
  //         id: true,
  //         address: true,
  //         name: true,
  //         symbol: true,
  //         decimals: true,
  //       },
  //     },
  //   },
  // },
  // hadEnabledSteerVault: true,
  // hasEnabledSteerVault: true,
  // steerVaults: {
  //   select: {
  //     id: true,
  //     address: true,
  //     chainId: true,

  //     feeTier: true,

  //     apr: true,
  //     apr1d: true,
  //     apr1w: true,
  //     // apr1m: true,
  //     // apr1y: true,

  //     token0: {
  //       select: {
  //         id: true,
  //         address: true,
  //         name: true,
  //         symbol: true,
  //         decimals: true,
  //       },
  //     },
  //     reserve0: true,
  //     reserve0USD: true,
  //     fees0: true,
  //     fees0USD: true,

  //     token1: {
  //       select: {
  //         id: true,
  //         address: true,
  //         name: true,
  //         symbol: true,
  //         decimals: true,
  //       },
  //     },
  //     reserve1: true,
  //     reserve1USD: true,
  //     fees1: true,
  //     fees1USD: true,

  //     reserveUSD: true,
  //     feesUSD: true,

  //     strategy: true,
  //     payloadHash: true,
  //     // description: true,
  //     // state: true

  //     performanceFee: true,

  //     lowerTick: true,
  //     upperTick: true,

  //     adjustmentFrequency: true,
  //     lastAdjustmentTimestamp: true,

  //     isEnabled: true,
  //     wasEnabled: true,

  //     creator: true,
  //     admin: true,
  //     manager: true,
  //   },
  // },
} as const satisfies Prisma.PoolSelect

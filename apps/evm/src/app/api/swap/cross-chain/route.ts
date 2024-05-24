import { NextRequest } from 'next/server'
import { getAllPrices } from 'src/lib/get-all-prices'
import { ChainId } from 'sushi/chain'
import { SushiXSwap2ChainId, isSushiXSwap2ChainId } from 'sushi/config'
import { Address, getAddress } from 'viem'
import { z } from 'zod'

export const schema = z.object({
  srcChainId: z.coerce
    .number()
    .refine((chainId) => isSushiXSwap2ChainId(chainId as ChainId), {
      message: `srchChainId must exist in SushiXSwapV2ChainId`,
    })
    .transform((chainId) => chainId as SushiXSwap2ChainId),
  dstChainId: z.coerce
    .number()
    .refine((chainId) => isSushiXSwap2ChainId(chainId as ChainId), {
      message: `dstChainId must exist in SushiXSwapV2ChainId`,
    })
    .transform((chainId) => chainId as SushiXSwap2ChainId),
  tokenIn: z.string(),
  tokenOut: z.string(),
  amount: z.string().transform((amount) => BigInt(amount)),
  srcGasPrice: z.optional(
    z.coerce
      .number()
      .int('gasPrice should be integer')
      .gt(0, 'gasPrice should be positive'),
  ),
  dstGasPrice: z.optional(
    z.coerce
      .number()
      .int('gasPrice should be integer')
      .gt(0, 'gasPrice should be positive'),
  ),
  to: z
    .optional(z.string())
    .transform((to) => (to ? (getAddress(to)) : undefined)),
  preferSushi: z.optional(z.coerce.boolean()),
  maxPriceImpact: z.optional(
    z.coerce
      .number()
      .lt(1, 'maxPriceImpact should be lesser than 1')
      .gt(0, 'maxPriceImpact should be positive'),
  ),
})

export const revalidate = 600

export async function GET(request: NextRequest) {
  const params = Object.fromEntries(request.nextUrl.searchParams.entries())

  const parsedParams = schema.parse(params)

  const crossChainSwap = 

  return Response.json(prices, {
    headers: {
      'Cache-Control': 'max-age=60, stale-while-revalidate=600',
    },
  })
}

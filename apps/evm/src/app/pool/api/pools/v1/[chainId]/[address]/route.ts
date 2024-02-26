import { PoolApiSchema, getPoolFromDB } from '@sushiswap/client2/api'
import { NextResponse } from 'next/server.js'
import { CORS } from '../../../../cors'

export const revalidate = 15

export async function GET(
  _request: Request,
  { params }: { params: { chainId: string; address: string } },
) {
  const result = PoolApiSchema.safeParse({
    chainId: params.chainId,
    address: params.address,
  })

  if (!result.success) {
    return NextResponse.json(result.error.format(), { status: 400 })
  }

  const pool = await getPoolFromDB(result.data)
  const p = {
      ...pool,
      chainId: Number(pool.chainId), // Temp, replace chainId with number instead of bigint for now. PALMs chain id is > max int?
  }

  return NextResponse.json(p, { headers: CORS })
}

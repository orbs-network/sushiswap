import { PoolsApiSchema, getPoolsFromDB } from '@sushiswap/client2/api'
import { NextResponse } from 'next/server.js'
import { CORS } from '../../cors'

export const revalidate = 15

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const result = PoolsApiSchema.safeParse(Object.fromEntries(searchParams))

  if (!result.success) {
    return NextResponse.json(result.error.format(), { status: 400 })
  }
 
  const pools = (await getPoolsFromDB(result.data)).map((p) => {
    p.chainId = Number(p.chainId) // Temp, replace chainId with number instead of bigint for now. PALMs chain id is > max int?
    return p
  })

  return NextResponse.json(pools, { headers: CORS })
}

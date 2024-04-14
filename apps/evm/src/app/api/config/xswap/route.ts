import { get } from '@vercel/edge-config'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({
  maintenance: z.boolean(),
})

export const runtime = 'nodejs'

export const revalidate = 60

export async function GET() {
  const data = await get('xswap')
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'maxage=15, stale-while-revalidate=45',
    },
  })
}

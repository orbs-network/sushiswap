import { PoolProtocol } from '@sushiswap/rockset-client'
import { unstable_cache } from 'next/cache'
import { notFound } from 'next/navigation'
import { getPool } from 'src/lib/flair/fetchers/pool/id/pool'
import { PoolPageV2 } from 'src/ui/pool/PoolPageV2'
import { PoolPageV3 } from 'src/ui/pool/PoolPageV3'
import { ID, unsanitize } from 'sushi'

export default async function PoolPage({
  params,
  tab,
}: {
  params: { id: string }
  tab: 'add' | 'remove' | 'unstake' | 'stake'
}) {
  const poolId = unsanitize(params.id)
  const { data: pool } = await unstable_cache(
    async () => getPool({ id: poolId as ID }),
    ['pool', poolId],
    {
      revalidate: 60 * 15,
    },
  )()

  if (!pool) {
    notFound()
  }

  if (pool.protocol === PoolProtocol.SUSHISWAP_V3) {
    return <PoolPageV3 pool={pool} />
  }

  return <PoolPageV2 pool={pool} tab={tab} />
}

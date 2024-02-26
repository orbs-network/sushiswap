import { PoolProtocol } from '@sushiswap/rockset-client'
import { unstable_cache } from 'next/cache'
import { PoolPageV2 } from 'src/ui/pool/PoolPageV2'
import { ID, unsanitize } from 'sushi'
import { PoolPageV3 } from '../../../../ui/pool/PoolPageV3'
import notFound from '../../not-found'
import { getPool } from '@sushiswap/client2'

export default async function PoolPage({
  params,
  tab,
}: {
  params: { id: string }
  tab: 'add' | 'remove' | 'unstake' | 'stake'
}) {
  const poolId = unsanitize(params.id)

  const pool = await unstable_cache(
    async () => getPool(poolId),
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

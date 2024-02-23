'use client'

import { Pool } from '@sushiswap/client2'
import {
  Card,
  CardContent,
  CardCurrencyAmountItem,
  CardDescription,
  CardGroup,
  CardHeader,
  CardLabel,
  CardTitle,
} from '@sushiswap/ui/components/card'
import React, { FC, useMemo } from 'react'
import { useTokenAmountDollarValues } from 'src/lib/hooks'
import { formatUSD } from 'sushi'
import { Amount, Token } from 'sushi/currency'

interface PoolCompositionProps {
  pool: Pool
}

export const PoolComposition: FC<PoolCompositionProps> = ({ pool }) => {
  const { amount0, amount1 } = useMemo(() => {
    const token0 = new Token({ ...pool.token0!, chainId: Number(pool.chainId) })
    const token1 = new Token({ ...pool.token1!, chainId: Number(pool.chainId) })

    const amount0 = Amount.fromRawAmount(token0, /*pool.reserve0BI*/ 0)
    const amount1 = Amount.fromRawAmount(token1, /*pool.reserve1BI*/ 0)

    return { amount0, amount1 }
  }, [pool])

  const fiatValues = useTokenAmountDollarValues({
    chainId: Number(pool.chainId),
    amounts: [amount0, amount1],
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pool Liquidity</CardTitle>
        <CardDescription>{formatUSD(pool.liquidityUSD)}</CardDescription>
      </CardHeader>
      <CardContent>
        <CardGroup>
          <CardLabel>Tokens</CardLabel>
          <CardCurrencyAmountItem
            amount={amount0}
            fiatValue={formatUSD(fiatValues?.[0] || 0)}
          />
          <CardCurrencyAmountItem
            amount={amount1}
            fiatValue={formatUSD(fiatValues?.[1] || 0)}
          />
        </CardGroup>
      </CardContent>
    </Card>
  )
}

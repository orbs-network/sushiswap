'use client'

import { ExclamationCircleIcon } from '@heroicons/react/24/outline'
import FaceSmileIcon from '@heroicons/react/24/outline/FaceSmileIcon'
import { ShieldCheckIcon } from '@heroicons/react/24/solid'
import { Pool } from '@sushiswap/client'
import { formatPercent, formatUSD } from '@sushiswap/format'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Chip,
  classNames,
  LinkInternal,
  Separator,
  Stat,
  StatLabel,
  StatValue,
} from '@sushiswap/ui'
import { usePathname } from 'next/navigation'
import { FC } from 'react'

import { SteerStrategyConfig } from './constants'

export const SteerPoolCard: FC<{ pool: Pool; vault: Pool['steerVaults'][0] }> = ({ pool, vault }) => {
  const pathname = usePathname()

  return (
    <LinkInternal href={`/pool/${pool.id}/positions/create/${vault.id}`}>
      <Card
        className={classNames(
          pathname.includes('stable-pool') ? 'border-blue' : '',
          'max-w-[400px] hover:border-blue-300 hover:shadow-md'
        )}
      >
        <CardHeader>
          <div className="flex gap-2 pb-3">
            <Chip className="bg-blue/20 text-blue">
              <ShieldCheckIcon className="h-3 w-3" />
              Lowest risk
            </Chip>
          </div>
          <CardTitle>{SteerStrategyConfig[vault.strategy].name}</CardTitle>
          <CardDescription>{SteerStrategyConfig[vault.strategy].description}</CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6">
          <Stat className="!p-0">
            {/* Gotta use the weekly APR for now, as that's what's provided by Steer, can look into getting custom APRs later */}
            <StatLabel>Weekly APR</StatLabel>
            <StatValue size="3xl">{formatPercent(vault.apr)}</StatValue>
          </Stat>
          <div className="h-[200px] bg-secondary rounded-xl flex items-center justify-center">
            <span className="text-xs text-muted-foreground">Chart here</span>
          </div>
        </CardContent>
        <Separator />
        <div className="grid grid-cols-2 divide-x divide-accent">
          <Stat className="px-6 py-4">
            <StatLabel size="sm">TVL</StatLabel>
            {/* vault.reserveUSD */}
            <StatValue size="sm">{formatUSD(123444)}</StatValue>
          </Stat>
          <Stat className="px-6 py-4">
            <StatLabel size="sm">Total Fees</StatLabel>
            {/* vault.feesUSD, will have to be total for now, will fix later */}
            <StatValue size="sm">{formatUSD(123)}</StatValue>
          </Stat>
        </div>
        <Separator />
        <div className="flex flex-col divide-y divide-accent">
          <div className="flex items-center p-6 gap-6">
            <FaceSmileIcon className="w-10 h-10 text-blue" />
            <div className="flex flex-col">
              <span className="text-sm font-medium">Good for like-kind assets and stable pairs</span>
              <span className="text-sm text-muted-foreground">Flexible adjustment to price movements.</span>
            </div>
          </div>
          <div className="flex items-center p-6 gap-6">
            <ExclamationCircleIcon className="w-10 h-10 text-gren" />
            <div className="flex flex-col">
              <span className="text-sm font-medium">Low impermanent loss risk</span>
              <span className="text-sm text-muted-foreground">
                Real return is less likely to suffer from impermanent loss.
              </span>
            </div>
          </div>
        </div>
      </Card>
    </LinkInternal>
  )
}

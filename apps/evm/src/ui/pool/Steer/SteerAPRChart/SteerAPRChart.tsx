import { Vault } from '@sushiswap/rockset-client'
import { getSteerVaultAprTimeseries } from '@sushiswap/steer-sdk'
import { useQuery } from '@tanstack/react-query'
import React from 'react'
import { _SteerAPRChart } from './_SteerAPRChart'

interface SteerAPRChartProps {
  vault: Vault
}

export function SteerAPRChart({ vault }: SteerAPRChartProps) {
  const { data, isInitialLoading } = useQuery(
    ['steer-vault-apr-timeseries', vault.id],
    () => getSteerVaultAprTimeseries({ vaultId: vault.id }),
  )

  return <_SteerAPRChart loading={isInitialLoading} timeseries={data} />
}

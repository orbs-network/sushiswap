import React, { FC, ReactNode } from 'react'
import type { UserWithPool } from 'src/app/pool/api/user-with-pools/route'
import { SUPPORTED_CHAIN_IDS } from 'src/config'
import { useSushiV2UserPositions } from 'src/lib/hooks'
import { useAccount } from 'wagmi'

interface PositionCardList {
  children({
    positions,
    isLoading,
  }: {
    positions: UserWithPool[]
    isLoading: boolean
  }): ReactNode
}

const value = (position: UserWithPool) =>
  (Number(position.unstakedBalance + position.stakedBalance) /
    Number(position.pool.liquidity)) *
  Number(position.pool.liquidityUSD)

export const PositionCardList: FC<PositionCardList> = ({ children }) => {
  const { address } = useAccount()
  const { data: userPositions, isLoading } = useSushiV2UserPositions({
    id: address!,
    chainIds: SUPPORTED_CHAIN_IDS,
  })

  return (
    <>
      {children({
        positions: isLoading
          ? new Array(6).fill(null)
          : (userPositions || []).sort((a, b) => value(b) - value(a)),
        isLoading,
      })}
    </>
  )
}

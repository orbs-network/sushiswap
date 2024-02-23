'use client'

import { useIsMounted } from '@sushiswap/hooks'
import { Button } from '@sushiswap/ui/components/button'
import { Dots } from '@sushiswap/ui/components/dots'
import {
  getMasterChefContractConfig,
  useMasterChefDeposit,
} from '@sushiswap/wagmi'
import { Checker } from '@sushiswap/wagmi/systems'
import {
  useApproved,
  withCheckerRoot,
} from '@sushiswap/wagmi/systems/Checker/Provider'
import { FC, useMemo, useState } from 'react'
import { APPROVE_TAG_STAKE } from 'src/lib/constants'
import { ChainId } from 'sushi/chain'
import { tryParseAmount } from 'sushi/currency'
import { ZERO } from 'sushi/math'

import { Pool } from '@sushiswap/client2'
import { IncentiveType } from '@sushiswap/rockset-client'
import { useExtendedPool } from 'src/lib/hooks/api/useFlairPoolGraphData'
import { AddSectionStakeWidget } from './AddSectionStakeWidget'

interface AddSectionStakeProps {
  pool: Pool
  incentiveType: IncentiveType
  title?: string
  farmId: number
}

export const AddSectionStake: FC<{ pool: Pool; title?: string }> = ({
  pool,
  title,
}) => {
  const isMounted = useIsMounted()

  if (!pool) return <></>

  // if (!pool?.incentives || pool.incentives.length === 0 || !isMounted)
  return <></>

  // return (
  //   <_AddSectionStake
  //     pool={pool}
  //     incentiveType={pool.incentives[0].type}
  //     title={title}
  //     farmId={Number(pool.incentives[0].poolId)}
  //   />
  // )
}

const _AddSectionStake: FC<AddSectionStakeProps> = withCheckerRoot(
  ({ pool, incentiveType, title, farmId }) => {
    const { approved } = useApproved(APPROVE_TAG_STAKE)
    const [value, setValue] = useState('')

    const { reserve0, reserve1, liquidityToken } = useExtendedPool({ pool })

    const amounts = useMemo(() => {
      return [tryParseAmount(value, liquidityToken)]
    }, [liquidityToken, value])

    const { sendTransaction, isLoading: isWritePending } = useMasterChefDeposit(
      {
        amount: amounts[0],
        chainId: Number(pool.chainId),
        chef: incentiveType,
        pid: farmId,
        enabled: Boolean(approved && amounts[0]?.greaterThan(ZERO) && pool),
      },
    )

    return (
      <AddSectionStakeWidget
        title={title}
        chainId={Number(pool.chainId)}
        value={value}
        setValue={setValue}
        reserve0={reserve0}
        reserve1={reserve1}
        liquidityToken={liquidityToken}
        isFarm={farmId !== undefined}
        // isIncentivized={pool.isIncentivized}
      >
        <Checker.Connect size="default" variant="outline" fullWidth>
          <Checker.Network
            size="default"
            variant="outline"
            fullWidth
            chainId={Number(pool.chainId)}
          >
            <Checker.Amounts
              size="default"
              variant="outline"
              fullWidth
              chainId={Number(pool.chainId) as ChainId}
              amounts={amounts}
            >
              <Checker.ApproveERC20
                size="default"
                variant="outline"
                fullWidth
                id="stake-approve-slp"
                amount={amounts[0]}
                contract={
                  getMasterChefContractConfig(
                    Number(pool.chainId),
                    incentiveType,
                  )?.address
                }
                enabled={Boolean(
                  getMasterChefContractConfig(
                    Number(pool.chainId),
                    incentiveType,
                  )?.address,
                )}
              >
                <Checker.Success tag={APPROVE_TAG_STAKE}>
                  <Button
                    size="default"
                    onClick={() => sendTransaction?.()}
                    fullWidth
                    disabled={isWritePending || !approved || !sendTransaction}
                    testId="stake-liquidity"
                  >
                    {isWritePending ? (
                      <Dots>Confirm transaction</Dots>
                    ) : (
                      'Stake Liquidity'
                    )}
                  </Button>
                </Checker.Success>
              </Checker.ApproveERC20>
            </Checker.Amounts>
          </Checker.Network>
        </Checker.Connect>
      </AddSectionStakeWidget>
    )
  },
)

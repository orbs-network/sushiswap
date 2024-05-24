import { NativeAddress } from '@sushiswap/react-query'
import { createConfig, readContract } from '@sushiswap/wagmi'
import { publicWagmiConfig } from '@sushiswap/wagmi-config'
import { stargateAdapterAbi } from 'sushi/abi'
import {
  STARGATE_ADAPTER_ADDRESS,
  STARGATE_CHAIN_ID,
  STARGATE_CHAIN_PATHS,
  STARGATE_ETH_ADDRESS,
  STARGATE_USDC,
  STARGATE_USDC_ADDRESS,
  STARGATE_USDT,
  STARGATE_USDT_ADDRESS,
  StargateAdapterChainId,
  isStargateAdapterChainId,
} from 'sushi/config'
import { Native } from 'sushi/currency'
import { Fraction, ONE, Percent, ZERO } from 'sushi/math'
import { RouterLiquiditySource } from 'sushi/router'
import {
  Address,
  encodeAbiParameters,
  parseAbiParameters,
  parseUnits,
} from 'viem'
import {
  STARGATE_DEFAULT_SLIPPAGE,
  SushiXSwap2Adapter,
  SushiXSwapTransactionType,
  encodeRouteProcessorArgs,
  encodeStargateTeleportParams,
  estimateStargateDstGas,
} from '../lib'
import {
  GetCrossChainTradeParams,
  GetCrossChainTradeResult,
} from './getCrossChainTrade'
import { getStargateFees } from './getStargateFees'
import { getTrade } from './getTrade'

const config = createConfig(publicWagmiConfig)

export const getStargateCrossChainTrade = async ({
  srcChainId,
  dstChainId,
  tokenIn,
  tokenOut,
  amount,
  slippagePercentage,
  srcGasPrice,
  dstGasPrice,
  recipient,
}: GetCrossChainTradeParams) => {
  const bridgePath =
    isStargateAdapterChainId(srcChainId) && isStargateAdapterChainId(dstChainId)
      ? getStargateBridgePath({ srcChainId, dstChainId, tokenIn, tokenOut })
      : undefined

  if (bridgePath) {
    const { srcBridgeToken, dstBridgeToken } = bridgePath

    // has swap on source chain
    // const isSrcSwap = Boolean(!token0.equals(bridgePath.srcBridgeToken))
    const isSrcSwap = Boolean(
      srcBridgeToken.isNative
        ? tokenIn !== NativeAddress
        : tokenIn !== srcBridgeToken.address,
    )

    // has swap on destination chain
    // const isDstSwap = Boolean(!token1.equals(bridgePath.dstBridgeToken))
    const isDstSwap = Boolean(
      dstBridgeToken.isNative
        ? tokenOut !== NativeAddress
        : tokenOut !== dstBridgeToken.address,
    )

    const srcTrade = isSrcSwap
      ? await getTrade({
          chainId: srcChainId,
          amount,
          fromToken: tokenIn,
          toToken: srcBridgeToken.isNative
            ? NativeAddress
            : srcBridgeToken.address,
          slippagePercentage,
          gasPrice: srcGasPrice,
          recipient:
            STARGATE_ADAPTER_ADDRESS[srcChainId as StargateAdapterChainId],
          source: RouterLiquiditySource.XSwap,
        })
      : undefined

    const srcTradeAmountOut =
      isSrcSwap && srcTrade?.status === 'Success'
        ? BigInt(srcTrade.assumedAmountOut)
        : undefined

    const bridgeFees =
      !isSrcSwap || srcTradeAmountOut
        ? await getStargateFees({
            amount: isSrcSwap ? (srcTradeAmountOut as bigint) : amount,
            srcBridgeToken,
            dstBridgeToken,
          })
        : undefined

    if (
      !amount ||
      !bridgeFees ||
      !bridgePath ||
      (isSrcSwap &&
        srcTrade?.status === 'Success' &&
        !srcTrade.routeProcessorArgs)
    )
      return {
        srcAmountOut: undefined,
        srcAmountOutMin: undefined,
        dstAmountIn: undefined,
        dstAmountInMin: undefined,
        bridgeImpact: undefined,
      }

    const [eqFee, eqReward, lpFee, protocolFee] = bridgeFees

    const bridgeFeeAmount = eqFee - eqReward + lpFee + protocolFee

    const srcAmountOut = isSrcSwap
      ? srcTrade?.status === 'Success' &&
        srcTrade.routeProcessorArgs?.amountOutMin
      : amount - bridgeFeeAmount

    const srcAmountOutMin = srcAmountOut
      ? new Fraction(ONE)
          .add(STARGATE_DEFAULT_SLIPPAGE)
          .invert()
          .multiply(srcAmountOut).quotient
      : undefined

    const dstAmountIn = srcAmountOut
      ? parseUnits(srcAmountOut.toString(), bridgePath.dstBridgeToken.decimals)
      : undefined

    const dstAmountInMin = srcAmountOutMin
      ? parseUnits(
          srcAmountOutMin.toString(),
          bridgePath.dstBridgeToken.decimals,
        )
      : undefined

    const bridgeImpact = new Percent(
      bridgeFeeAmount || bridgeFeeAmount === 0n
        ? 1
        : isSrcSwap &&
            srcTrade?.status === 'Success' &&
            srcTrade.routeProcessorArgs
          ? BigInt(srcTrade.routeProcessorArgs.amountOutMin)
          : amount,
    )

    const dstTrade =
      isDstSwap && dstAmountIn
        ? await getTrade({
            chainId: dstChainId,
            amount: dstAmountIn,
            fromToken: dstBridgeToken.isNative
              ? NativeAddress
              : dstBridgeToken.address,
            toToken: tokenOut,
            slippagePercentage,
            gasPrice: dstGasPrice,
            recipient,
            source: RouterLiquiditySource.XSwap,
          })
        : undefined

    const dstAmountOut = isDstSwap
      ? dstTrade?.status === 'Success' && dstTrade?.routeProcessorArgs
        ? BigInt(dstTrade?.assumedAmountOut)
        : undefined
      : dstAmountIn

    const dstAmountOutMin = isDstSwap
      ? dstTrade?.status === 'Success' && dstTrade?.routeProcessorArgs
        ? BigInt(dstTrade?.routeProcessorArgs.amountOutMin)
        : undefined
      : dstAmountInMin

    let priceImpact = bridgeImpact
    if (isSrcSwap && srcTrade?.status === 'Success')
      priceImpact = priceImpact.add(srcTrade?.priceImpact ?? 0)
    if (isDstSwap && dstTrade?.status === 'Success')
      priceImpact = priceImpact.add(dstTrade?.priceImpact ?? 0)

    if (!recipient) {
      return {
        adapter: SushiXSwap2Adapter.Stargate,
        priceImpact: priceImpact.quotient,
        amountIn: amount,
        amountOut: dstAmountOut,
        minAmountOut: dstAmountOutMin,
      } as GetCrossChainTradeResult
    }

    let writeArgs
    let functionName
    let dstPayload
    let dstGasEst = ZERO
    let transactionType

    if (!isSrcSwap && !isDstSwap) {
      transactionType = SushiXSwapTransactionType.Bridge
      functionName = 'bridge'
      writeArgs = [
        {
          refId: '0x0000',
          adapter:
            STARGATE_ADAPTER_ADDRESS[srcChainId as StargateAdapterChainId],
          tokenIn,
          amountIn: amount,
          to: recipient,
          adapterData: encodeStargateTeleportParams({
            srcBridgeToken,
            dstBridgeToken,
            amount: amount,
            amountMin: srcAmountOutMin as bigint,
            dustAmount: 0,
            receiver: recipient, // receivier is recipient because no dstPayload
            to: recipient,
            dstGas: dstGasEst,
          }),
        },
        recipient, // refundAddress
        '0x', // swapPayload
        '0x', // payloadData
      ]
    } else if (
      isSrcSwap &&
      !isDstSwap &&
      srcTrade?.status === 'Success' &&
      srcTrade?.routeProcessorArgs
    ) {
      const srcSwapData = encodeRouteProcessorArgs(srcTrade.routeProcessorArgs)

      transactionType = SushiXSwapTransactionType.SwapAndBridge
      functionName = 'swapAndBridge'
      writeArgs = [
        {
          refId: '0x0000',
          adapter:
            STARGATE_ADAPTER_ADDRESS[srcChainId as StargateAdapterChainId],
          tokenIn,
          amountIn: amount,
          to: recipient,
          adapterData: encodeStargateTeleportParams({
            srcBridgeToken,
            dstBridgeToken,
            amount: 0,
            amountMin: srcAmountOutMin as bigint,
            dustAmount: 0,
            receiver: recipient, // receivier is recipient because no dstPayload
            to: recipient,
            dstGas: dstGasEst,
          }),
        },
        recipient, // refundAddress
        srcSwapData,
        '0x',
        '0x',
      ]
    } else if (
      !isSrcSwap &&
      dstTrade?.status === 'Success' &&
      dstTrade?.routeProcessorArgs
    ) {
      const dstSwapData = encodeRouteProcessorArgs(dstTrade.routeProcessorArgs)

      dstGasEst = estimateStargateDstGas(dstTrade.gasSpent)

      dstPayload = encodeAbiParameters(
        parseAbiParameters('address, bytes, bytes'),
        [
          recipient,
          dstSwapData,
          '0x', // payloadData
        ],
      )

      transactionType = SushiXSwapTransactionType.BridgeAndSwap
      functionName = 'bridge'
      writeArgs = [
        {
          refId: '0x0000',
          adapter:
            STARGATE_ADAPTER_ADDRESS[srcChainId as StargateAdapterChainId],
          tokenIn,
          amountIn: amount,
          to: recipient,
          adapterData: encodeStargateTeleportParams({
            srcBridgeToken,
            dstBridgeToken,
            amount: amount,
            amountMin: srcAmountOutMin as bigint,
            dustAmount: 0,
            receiver:
              STARGATE_ADAPTER_ADDRESS[dstChainId as StargateAdapterChainId],
            to: recipient,
            dstGas: dstGasEst,
          }),
        },
        recipient, // refundAddress
        dstSwapData,
        '0x', // dstPayload
      ]
    } else if (
      isSrcSwap &&
      isDstSwap &&
      srcTrade?.status === 'Success' &&
      dstTrade?.status === 'Success' &&
      srcTrade?.routeProcessorArgs &&
      dstTrade?.routeProcessorArgs
    ) {
      const srcSwapData = encodeRouteProcessorArgs(srcTrade.routeProcessorArgs)
      const dstSwapData = encodeRouteProcessorArgs(dstTrade.routeProcessorArgs)

      dstPayload = encodeAbiParameters(
        parseAbiParameters('address, bytes, bytes'),
        [
          recipient, // to
          dstSwapData, // swapData
          '0x', // payloadData
        ],
      )
      dstGasEst = estimateStargateDstGas(
        dstTrade?.status === 'Success' ? dstTrade.gasSpent : 0,
      )

      transactionType = SushiXSwapTransactionType.CrossChainSwap
      functionName = 'swapAndBridge'
      writeArgs = [
        {
          refId: '0x0000',
          adapter:
            STARGATE_ADAPTER_ADDRESS[srcChainId as StargateAdapterChainId],
          tokenIn,
          amountIn: amount,
          to: recipient,
          adapterData: encodeStargateTeleportParams({
            srcBridgeToken,
            dstBridgeToken,
            amount: 0,
            amountMin: srcAmountOutMin as bigint,
            dustAmount: 0,
            receiver:
              STARGATE_ADAPTER_ADDRESS[dstChainId as StargateAdapterChainId],
            to: recipient,
            dstGas: dstGasEst,
          }),
        },
        recipient, // refundAddress
        srcSwapData, //srcSwapPayload
        dstSwapData, // dstPayload
        '0x',
      ]
    } else {
      throw new Error('Crosschain swap not found.')
    }

    let [bridgeFee] = await readContract(config, {
      address: STARGATE_ADAPTER_ADDRESS[srcChainId as StargateAdapterChainId],
      abi: stargateAdapterAbi,
      functionName: 'getFee',
      args: [
        STARGATE_CHAIN_ID[dstChainId as StargateAdapterChainId], // dstChain
        1, // functionType
        isDstSwap
          ? STARGATE_ADAPTER_ADDRESS[dstChainId as StargateAdapterChainId]
          : recipient, // receiver
        dstGasEst, // gasAmount
        0n, // dustAmount
        isDstSwap ? dstPayload! : '0x', // payload
      ],
    })

    // Add 20% buffer to STG fee
    bridgeFee = (bridgeFee * 5n) / 4n

    const value =
      tokenIn === NativeAddress ? BigInt(amount) + bridgeFee : bridgeFee

    // est 500K gas for XSwapV2 call
    const srcGasEst =
      500000n + BigInt(srcTrade?.status === 'Success' ? srcTrade?.gasSpent : 0)

    const srcGasFee = srcGasEst * srcGasPrice

    const gasSpent = srcGasFee + bridgeFee

    return {
      transactionType,
      srcTrade,
      dstTrade,
      srcBridgeToken,
      dstBridgeToken,
      priceImpact,
      amountIn: amount,
      amountOut: dstAmountOut,
      minAmountOut: dstAmountOutMin,
      gasSpent: gasSpent,
      bridgeFee: bridgeFee,
      srcGasFee: srcGasFee,
      writeArgs,
      route: {
        status: 'Success',
      },
      functionName,
      value,
    }
  }

  return undefined
}

export const getStargateBridgePath = ({
  srcChainId,
  dstChainId,
  tokenIn,
}: {
  srcChainId: StargateAdapterChainId
  dstChainId: StargateAdapterChainId
  tokenIn: Address
  tokenOut: Address
}) => {
  const srcChainPaths = STARGATE_CHAIN_PATHS[srcChainId]

  // If srcCurrency is ETH, check for ETH path
  if (tokenIn === NativeAddress && srcChainId in STARGATE_ETH_ADDRESS) {
    const ethPaths =
      srcChainPaths[
        STARGATE_ETH_ADDRESS[srcChainId as keyof typeof STARGATE_ETH_ADDRESS]
      ]

    if (
      ethPaths.find((dstBridgeToken) => dstBridgeToken.chainId === dstChainId)
    ) {
      return {
        srcBridgeToken: Native.onChain(srcChainId),
        dstBridgeToken: Native.onChain(dstChainId),
      }
    }
  }

  // Else fallback to USDC/USDT
  if (
    srcChainId in STARGATE_USDC_ADDRESS ||
    srcChainId in STARGATE_USDT_ADDRESS
  ) {
    const srcBridgeToken =
      srcChainId in STARGATE_USDC
        ? STARGATE_USDC[srcChainId as keyof typeof STARGATE_USDC]
        : STARGATE_USDT[srcChainId as keyof typeof STARGATE_USDT]

    const usdPaths = srcChainPaths[srcBridgeToken.address as Address]

    const dstBridgeToken = usdPaths.find(
      (dstBridgeToken) => dstBridgeToken.chainId === dstChainId,
    )

    if (dstBridgeToken) {
      return {
        srcBridgeToken,
        dstBridgeToken,
      }
    }
  }

  return undefined
}

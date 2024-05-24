import {
  ChainType,
  DexName,
  Hook,
  RouteRequest,
  SquidCallType,
} from '@0xsquid/squid-types'
import { NativeAddress, UseTradeReturn } from '@sushiswap/react-query'
import { routeProcessor4Abi, squidRouterAbi } from 'sushi/abi'
import {
  ROUTE_PROCESSOR_4_ADDRESS,
  SQUID_ADAPTER_ADDRESS,
  SQUID_ROUTER_ADDRESS,
  isSquidAdapterChainId,
} from 'sushi/config'
import { Token, axlUSDC } from 'sushi/currency'
import { Percent, ZERO_PERCENT } from 'sushi/math'
import { RouterLiquiditySource } from 'sushi/router'
import {
  Address,
  Hex,
  WriteContractParameters,
  encodeFunctionData,
  erc20Abi,
  zeroAddress,
} from 'viem'
import {
  SushiXSwap2Adapter,
  SushiXSwapTransactionType,
  decodeSquidRouterCallData,
  encodeRouteProcessorArgs,
  encodeSquidBridgeParams,
  isSquidRouteProcessorEnabled,
  tokenToRToken,
} from '../lib'
import { Squid as _Squid } from '../lib/squid'
import {
  GetCrossChainTradeParams,
  GetCrossChainTradeResult,
} from './getCrossChainTrade'
import { getTrade } from './getTrade'

export const getSquidCrossChainTrade = async ({
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
  const Squid = _Squid.initialized
    ? _Squid
    : await _Squid.init().then(() => _Squid)

  const bridgePath =
    isSquidAdapterChainId(srcChainId) && isSquidAdapterChainId(dstChainId)
      ? {
          srcBridgeToken: axlUSDC[srcChainId],
          dstBridgeToken: axlUSDC[dstChainId],
        }
      : undefined

  if (bridgePath) {
    const { srcBridgeToken, dstBridgeToken } = bridgePath

    // has swap on source chain
    const isSrcSwap = Boolean(
      //   bridgePath?.srcBridgeToken &&
      tokenIn !== srcBridgeToken.address,
    )

    // has swap on destination chain
    const isDstSwap = Boolean(
      //   bridgePath?.dstBridgeToken &&
      tokenOut !== dstBridgeToken.address,
    )

    // whether to use RP for routing, uses to Squid when
    // no liquidity through RP-compatible pools

    const useRPOnSrc = Boolean(
      isSrcSwap && isSquidRouteProcessorEnabled[srcChainId],
    )

    const useRPOnDst = Boolean(
      isDstSwap && isSquidRouteProcessorEnabled[dstChainId],
    )

    const srcTrade = useRPOnSrc
      ? await getTrade({
          chainId: srcChainId,
          amount,
          fromToken: tokenIn,
          toToken: srcBridgeToken.address,
          slippagePercentage,
          gasPrice: srcGasPrice,
          recipient: SQUID_ROUTER_ADDRESS[srcChainId],
          source: RouterLiquiditySource.XSwap,
        })
      : undefined

    const srcTradeAmountOutMin =
      srcTrade?.status === 'Success' &&
      srcTrade.routeProcessorArgs?.amountOutMin
        ? BigInt(srcTrade.routeProcessorArgs.amountOutMin)
        : undefined

    const dstAmountIn = useRPOnSrc ? srcTradeAmountOutMin : amount

    const dstTrade =
      useRPOnDst && dstAmountIn
        ? await getTrade({
            chainId: dstChainId,
            amount: dstAmountIn,
            fromToken: dstBridgeToken.address,
            toToken: tokenOut,
            slippagePercentage,
            gasPrice: dstGasPrice,
            recipient,
            source: RouterLiquiditySource.XSwap,
          })
        : undefined

    // getSquidRouteRequest({
    //     token0,
    //     token1,
    //     amount,
    //     fromAddress: address,
    //     toAddress: recipient,
    //     bridgePath,
    //     slippagePercentage,
    //     isSrcSwap,
    //     isDstSwap,
    //     srcTrade,
    //     dstTrade,
    //   })

    const routeRequest: RouteRequest = {
      //   fromAddress: tokenIn, is this needed?
      //   toAddress: to, is this needed?
      fromChain: srcChainId.toString(),
      toChain: dstChainId.toString(),
      fromToken: useRPOnSrc ? srcBridgeToken.address : tokenIn,
      toToken: useRPOnDst ? dstBridgeToken.address : tokenOut,
      fromAmount: (dstAmountIn ?? 0)?.toString(), // TODO
      slippageConfig: {
        slippage: Number(slippagePercentage),
        autoMode: 1,
      },
      prefer: [DexName.SUSHISWAP_V3, DexName.SUSHISWAP],
      //   quoteOnly: !fromAddress || !toAddress,
    }

    if (
      useRPOnDst &&
      dstTrade?.status === 'Success' &&
      dstTrade?.routeProcessorArgs
    ) {
      const rpAddress = ROUTE_PROCESSOR_4_ADDRESS[dstChainId]

      if (rpAddress === undefined) throw new Error('RP not found')

      // Transfer dstBridgeToken to RouteProcessor & call ProcessRoute()
      routeRequest.postHook = {
        chainType: ChainType.EVM,
        calls: [
          // Transfer full balance of dstBridgeToken to RouteProcessor
          {
            chainType: ChainType.EVM,
            callType: SquidCallType.FULL_TOKEN_BALANCE,
            target: dstBridgeToken.address,
            callData: encodeFunctionData({
              abi: erc20Abi,
              functionName: 'transfer',
              args: [rpAddress, 0n],
            }),
            value: '0',
            payload: {
              tokenAddress: dstBridgeToken.address,
              inputPos: 1,
            },
            estimatedGas: '30000',
          },
          // Invoke RouteProcessor.processRoute()
          {
            chainType: ChainType.EVM,
            callType: SquidCallType.DEFAULT,
            target: rpAddress,
            callData: encodeFunctionData({
              abi: routeProcessor4Abi,
              functionName: 'processRoute',
              args: [
                dstTrade.routeProcessorArgs.tokenIn as Address,
                BigInt(dstTrade.routeProcessorArgs.amountIn),
                dstTrade.routeProcessorArgs.tokenOut as Address,
                BigInt(dstTrade.routeProcessorArgs.amountOutMin),
                dstTrade.routeProcessorArgs.to,
                dstTrade.routeProcessorArgs.routeCode as Hex,
              ] as WriteContractParameters<
                typeof routeProcessor4Abi,
                'processRoute'
              >['args'],
            }),
            value: '0',
            payload: {
              tokenAddress: zeroAddress,
              inputPos: 0,
            },
            estimatedGas: (1.2 * dstTrade.gasSpent + 20_000).toString(),
          },
        ],
        description: `Swap ${tokenIn} -> ${tokenOut} on RouteProcessor`,
      } as Hook
    }

    const { route: squidRoute } = await Squid.getRoute(routeRequest)

    const dstAmountOut = useRPOnDst
      ? dstTrade?.status === 'Success'
        ? BigInt(dstTrade.assumedAmountOut)
        : undefined
      : squidRoute.estimate.toAmount

    const dstAmountOutMin = useRPOnDst
      ? dstTrade?.status === 'Success' &&
        dstTrade?.routeProcessorArgs?.amountOutMin
        ? BigInt(dstTrade.routeProcessorArgs.amountOutMin)
        : undefined
      : squidRoute.estimate.toAmountMin

    let priceImpact = ZERO_PERCENT
    if (useRPOnSrc && srcTrade?.status === 'Success')
      priceImpact = priceImpact.add(srcTrade.priceImpact)
    if (useRPOnDst && dstTrade?.status === 'Success')
      priceImpact = priceImpact.add(dstTrade.priceImpact)

    priceImpact = priceImpact.add(
      new Percent(
        Math.round(Number(squidRoute.estimate.aggregatePriceImpact) * 100),
        10000,
      ),
    )

    if (!recipient) {
      return {
        adapter: SushiXSwap2Adapter.Squid,
        priceImpact: priceImpact.quotient,
        amountIn: amount,
        amountOut: dstAmountOut,
        minAmountOut: dstAmountOutMin,
      } as GetCrossChainTradeResult
    }

    let writeArgs
    let functionName
    const transactionType =
      !isSrcSwap && !isDstSwap
        ? SushiXSwapTransactionType.Bridge
        : isSrcSwap && !isDstSwap
          ? SushiXSwapTransactionType.SwapAndBridge
          : !isSrcSwap && isDstSwap
            ? SushiXSwapTransactionType.BridgeAndSwap
            : SushiXSwapTransactionType.CrossChainSwap

    if (
      useRPOnSrc &&
      srcTrade?.status === 'Success' &&
      srcTrade.routeProcessorArgs
    ) {
      const srcSwapData = encodeRouteProcessorArgs(srcTrade.routeProcessorArgs)

      const squidCallData = decodeSquidRouterCallData(
        squidRoute.transactionRequest?.data as `0x${string}`,
      )

      const squidCallArgs =
        squidCallData.args && squidCallData.args.length > 1
          ? [squidCallData.args[0], 0, ...squidCallData.args.slice(2)]
          : undefined

      functionName = 'swapAndBridge'
      writeArgs = [
        {
          refId: '0x0000',
          adapter: SQUID_ADAPTER_ADDRESS[srcChainId],
          tokenIn,
          amountIn: amount,
          to: recipient,
          adapterData: encodeSquidBridgeParams({
            srcBridgeToken,
            callData: encodeFunctionData({
              abi: squidRouterAbi,
              functionName: squidCallData.functionName,
              args: squidCallArgs,
            }),
          }),
        },
        recipient, // refundAddress
        srcSwapData, // srcSwapData
        '0x', // dstSwapData
        '0x', // dstPayloadData
      ]
    } else {
      functionName = 'bridge'
      writeArgs = [
        {
          refId: '0x0000',
          adapter: SQUID_ADAPTER_ADDRESS[srcChainId],
          tokenIn,
          amountIn: amount,
          to: recipient,
          adapterData: encodeSquidBridgeParams({
            srcBridgeToken,
            callData: squidRoute.transactionRequest?.data as Hex,
          }),
        },
        recipient, // refundAddress
        '0x', // dstSwapData
        '0x', // dstPayloadData
      ]
    }

    // Add 10 % buffer
    const bridgeFee =
      (squidRoute.estimate.feeCosts.reduce(
        (accumulator, current) => accumulator + BigInt(current.amount),
        0n,
      ) *
        11n) /
      10n

    const value =
      tokenIn === NativeAddress
        ? BigInt(amount) + BigInt(bridgeFee)
        : BigInt(bridgeFee)

    const srcGasEstimate =
      BigInt(squidRoute.transactionRequest?.gasLimit ?? 0) +
      (useRPOnSrc && srcTrade?.status === 'Success'
        ? BigInt(srcTrade.gasSpent)
        : 0n)

    const srcGasFee = srcGasEstimate * srcGasPrice

    const gasSpent = srcGasFee + bridgeFee

    return {
      transactionType,
      srcTrade: isSrcSwap
        ? srcTrade ??
          ({
            route: {
              legs: [
                {
                  poolName: 'Squid',
                  tokenFrom: tokenToRToken(
                    new Token({
                      ...squidRoute.estimate.fromToken,
                    }),
                  ),
                  tokenTo: tokenToRToken(srcBridgeToken),
                  absolutePortion: 1,
                },
              ],
            },
          } as UseTradeReturn)
        : undefined,
      dstTrade: isDstSwap
        ? dstTrade ??
          ({
            route: {
              legs: [
                {
                  poolName: 'Squid',
                  tokenFrom: tokenToRToken(dstBridgeToken),
                  tokenTo: tokenToRToken(
                    new Token({
                      ...squidRoute.estimate.toToken,
                    }),
                  ),
                  absolutePortion: 1,
                },
              ],
            },
          } as UseTradeReturn)
        : undefined,
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

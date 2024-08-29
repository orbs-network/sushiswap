'use client'

import { usePrice, useTrade as useApiTrade } from '@sushiswap/react-query'
import { watchChainId } from '@wagmi/core'
import { useLogger } from 'next-axiom'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import {
  FC,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useSlippageTolerance } from 'src/lib/hooks/useSlippageTolerance'
import { useTokenWithCache } from 'src/lib/wagmi/hooks/tokens/useTokenWithCache'
import { useClientTrade } from 'src/lib/wagmi/hooks/trade/use-client-trade'
import { ChainId, TestnetChainId } from 'sushi/chain'
import {Config, Configs, Duration, getChunks, getDeadline, getDstTokenAmount, getDstTokenMinAmount, getDuration, getFillDelay, getMaxPossibleChunks, getMinDuration, getSrcChunkAmount, getSrcChunkAmountUsd, Token} from "@orbs-network/twap-sdk"
import {
  defaultCurrency,
  defaultQuoteCurrency,
  isWNativeSupported,
} from 'sushi/config'
import { Amount, Native, Type, tryParseAmount } from 'sushi/currency'
import { Percent, ZERO } from 'sushi/math'
import { Address, isAddress } from 'viem'
import { useAccount, useChainId, useConfig, useGasPrice } from 'wagmi'
import { isSupportedChainId, isSwapApiEnabledChainId } from '../../../config'
import { useCarbonOffset } from '../../../lib/swap/useCarbonOffset'
const configs = [Configs.SushiArb, Configs.SushiBase]

const getTokenAsString = (token: Type | string) =>
  typeof token === 'string'
    ? token
    : token.isNative
      ? 'NATIVE'
      : token.wrapped.address
const getDefaultCurrency = (chainId: number) =>
  getTokenAsString(defaultCurrency[chainId as keyof typeof defaultCurrency])
const getQuoteCurrency = (chainId: number) =>
  getTokenAsString(
    defaultQuoteCurrency[chainId as keyof typeof defaultQuoteCurrency],
  )

interface State {
  mutate: {
    setChainId(chainId: number): void
    setToken0(token0: Type | string): void
    setToken1(token1: Type | string): void
    setTokens(token0: Type | string, token1: Type | string): void
    setSwapAmount(swapAmount: string): void
    switchTokens(): void
    setTokenTax(tax: Percent | false | undefined): void
    setForceClient(forceClient: boolean): void
    setTypedChunks(value: number): void
    setTypedFillDelay(value: Duration): void
    onLimitPrice(value: string): void
    setTypedDuration(value: Duration): void
  }
  state: {
    token0: Type | undefined
    token1: Type | undefined
    chainId: ChainId
    swapAmountString: string
    swapAmount: Amount<Type> | undefined
    recipient: string | undefined
    tokenTax: Percent | false | undefined
    forceClient: boolean
    typedChunks?: number;
    typedFillDelay?: Duration;
    typedDuration? : Duration;
    typedlimitPrice?:Amount<Type> | undefined
  }
  isLoading: boolean
  isToken0Loading: boolean
  isToken1Loading: boolean
  twapConfig: Config
  isLimit?: boolean
}

const DerivedStateSimpleSwapContext = createContext<State>({} as State)

interface DerivedStateTwapSwapProviderProps {
  children: React.ReactNode
  isLimit?: boolean
}

/* Parses the URL and provides the chainId, token0, and token1 globally.
 * URL example:
 * /swap?chainId=1&token0=NATIVE&token1=0x6b3595068778dd592e39a122f4f5a5cf09c90fe2
 *
 * If no chainId is provided, it defaults to current connected chainId or Ethereum if wallet is not connected.
 */
const DerivedstateTwapSwapProvider: FC<DerivedStateTwapSwapProviderProps> =
  ({ children, isLimit }) => {
    const { push } = useRouter()
    const _chainId = useChainId()
    const { address } = useAccount()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [typedChunks, setTypedChunks] = useState<number | undefined>(undefined)
    const [typedDuration, setTypedDuration] = useState<Duration | undefined>(undefined)
    const [typedlimitPrice, setTypedLimitPrice] = useState<Amount<Type>  |undefined>(undefined)
    const [typedFillDelay, setTypedFillDelay] = useState<Duration | undefined>(undefined)
    const [tokenTax, setTokenTax] = useState<Percent | false | undefined>(
      undefined,
    )
    const [forceClient, setForceClient] = useState(false)

    // Get the searchParams and complete with defaults.
    // This handles the case where some params might not be provided by the user
    const defaultedParams = useMemo(() => {
      const params = new URLSearchParams(searchParams)
      if (!params.has('chainId') || !params.get('chainId'))
        params.set(
          'chainId',
          (isSupportedChainId(_chainId)
            ? _chainId
            : ChainId.ETHEREUM
          ).toString(),
        )
      if (!params.has('token0')) {
        params.set('token0', getDefaultCurrency(Number(params.get('chainId'))))
      }
      if (!params.has('token1')) {
        params.set('token1', getQuoteCurrency(Number(params.get('chainId'))))
      }
      return params
    }, [_chainId, searchParams])

    // Get a new searchParams string by merging the current
    // searchParams with a provided key/value pair
    const createQueryString = useCallback(
      (values: { name: string; value: string | null }[]) => {
        const params = new URLSearchParams(defaultedParams)
        values.forEach(({ name, value }) => {
          if (value === null) {
            params.delete(name)
          } else {
            params.set(name, value)
          }
        })
        return params.toString()
      },
      [defaultedParams],
    )

    // Update the URL with a new chainId
    const setChainId = useCallback(
      (chainId: number) => {
        console.log('setChainId', chainId)
        push(
          `${pathname}?${createQueryString([
            { name: 'swapAmount', value: null },
            { name: 'chainId', value: chainId.toString() },
            { name: 'token0', value: getDefaultCurrency(chainId) },
            { name: 'token1', value: getQuoteCurrency(chainId) },
          ])}`,
          { scroll: false },
        )
      },
      [createQueryString, pathname, push],
    )



    // Switch token0 and token1
    const switchTokens = useCallback(() => {
      // console.log('switchTokens', {
      //   token0: defaultedParams.get('token1'),
      //   token1: defaultedParams.get('token0'),
      // })
      push(
        `${pathname}?${createQueryString([
          { name: 'swapAmount', value: null },
          { name: 'token0', value: defaultedParams.get('token1') as string },
          { name: 'token1', value: defaultedParams.get('token0') as string },
        ])}`,
        { scroll: false },
      )
    }, [createQueryString, defaultedParams, pathname, push])

    // Update the URL with a new token0
    const setToken0 = useCallback<{ (_token0: string | Type): void }>(
      (_token0) => {
        console.log('setToken0', _token0)

        // If entity is provided, parse it to a string
        const token0 = getTokenAsString(_token0)

        // Switch tokens if the new token0 is the same as the current token1
        if (
          defaultedParams.get('token1')?.toLowerCase() === token0.toLowerCase()
        ) {
          // console.log('setToken0 switch tokens')
          switchTokens()
        }

        // Push new route
        else {
          push(
            `${pathname}?${createQueryString([
              { name: 'token0', value: token0 },
            ])}`,
            { scroll: false },
          )
        }
      },
      [createQueryString, defaultedParams, pathname, push, switchTokens],
    )

    // Update the URL with a new token1
    const setToken1 = useCallback<{ (_token1: string | Type): void }>(
      (_token1) => {
        console.log('setToken1', _token1)

        // If entity is provided, parse it to a string
        const token1 = getTokenAsString(_token1)

        // Switch tokens if the new token0 is the same as the current token1
        if (
          defaultedParams.get('token0')?.toLowerCase() === token1.toLowerCase()
        ) {
          console.log('setToken1 switch tokens')
          switchTokens()
        }

        // Push new route
        else {
          push(
            `${pathname}?${createQueryString([
              { name: 'token1', value: token1 },
            ])}`,
            { scroll: false },
          )
        }
      },
      [createQueryString, defaultedParams, pathname, push, switchTokens],
    )

    // Update the URL with both tokens
    const setTokens = useCallback<{
      (_token0: string | Type, _token1: string | Type): void
    }>(
      (_token0, _token1) => {
        // If entity is provided, parse it to a string
        const token0 = getTokenAsString(_token0)
        const token1 = getTokenAsString(_token1)

        push(
          `${pathname}?${createQueryString([
            { name: 'token0', value: token0 },
            { name: 'token1', value: token1 },
          ])}`,
          { scroll: false },
        )
      },
      [createQueryString, pathname, push],
    )

    // Update the URL with a new swapAmount
    const setSwapAmount = useCallback<{ (value: string): void }>(
      (value) => {
        push(
          `${pathname}?${createQueryString([
            { name: 'swapAmount', value: value },
          ])}`,
          { scroll: false },
        )
      },
      [createQueryString, pathname, push],
    )

    // Derive chainId from defaultedParams
    const chainId = Number(defaultedParams.get('chainId')) as Exclude<
      ChainId,
      TestnetChainId
    >



    

    // console.log(_chainId, chainId)

    // const { switchChain } = useSwitchChain()

    // useEffect(() => {
    //   if (_chainId !== chainId) {
    //     // setChainId(chainId)
    //     switchChain({ chainId })
    //   }
    // }, [_chainId, chainId, switchChain, setChainId])

    const config = useConfig()

    useEffect(() => {
      const unwatch = watchChainId(config, {
        onChange: (newChainId) => {
          if (newChainId === chainId) return
          setChainId(newChainId)
        },
      })
      return () => unwatch()
    }, [config, chainId, setChainId])

    // Derive token0
    const { data: token0, isInitialLoading: token0Loading } = useTokenWithCache(
      {
        chainId,
        address: defaultedParams.get('token0') as string,
        enabled: isAddress(defaultedParams.get('token0') as string),
        keepPreviousData: false,
      },
    )

    // Derive token1
    const { data: token1, isInitialLoading: token1Loading } = useTokenWithCache(
      {
        chainId,
        address: defaultedParams.get('token1') as string,
        enabled: isAddress(defaultedParams.get('token1') as string),
        keepPreviousData: false,
      },
    )


    const twapConfig = useMemo(() => {
      return configs.find((config) => config.chainId === chainId) || configs[0]
    }, [chainId])


    const onLimitPrice = useCallback(
      (limitPrice: string) => {
        setTypedLimitPrice(tryParseAmount(limitPrice, token1))
      },
      [setTypedLimitPrice, token1],
    )

    return (
      <DerivedStateSimpleSwapContext.Provider
        value={useMemo(() => {
          const swapAmountString = defaultedParams.get('swapAmount') || ''
          const _token0 =
            defaultedParams.get('token0') === 'NATIVE' &&
            isWNativeSupported(chainId)
              ? Native.onChain(chainId)
              : token0
          const _token1 =
            defaultedParams.get('token1') === 'NATIVE' &&
            isWNativeSupported(chainId)
              ? Native.onChain(chainId)
              : token1

          return {
            mutate: {
              setChainId,
              setToken0,
              setToken1,
              setTokens,
              switchTokens,
              setSwapAmount,
              setTokenTax,
              setForceClient,
              setTypedChunks,
              setTypedFillDelay,
              onLimitPrice,
              setTypedDuration
            },
            state: {
              recipient: address ?? '',
              chainId,
              swapAmountString,
              swapAmount: tryParseAmount(swapAmountString, _token0),
              token0: _token0,
              token1: _token1,
              tokenTax,
              forceClient,
              typedChunks,
              typedFillDelay,
              typedlimitPrice,
              typedDuration,
            },
            isLoading: token0Loading || token1Loading,
            isToken0Loading: token0Loading,
            isToken1Loading: token1Loading,
            twapConfig,
            isLimit
          }
        }, [
          address,
          chainId,
          defaultedParams,
          setChainId,
          setSwapAmount,
          setToken0,
          setToken1,
          setTokens,
          switchTokens,
          token0,
          token0Loading,
          token1,
          token1Loading,
          tokenTax,
          forceClient,
        ])}
      >
        {children}
      </DerivedStateSimpleSwapContext.Provider>
    )
  }

const useDerivedStateTwapSwap = () => {
  const context = useContext(DerivedStateSimpleSwapContext)
  if (!context) {
    throw new Error(
      'Hook can only be used inside Simple Swap Derived State Context',
    )
  }

  return context
}

const useFallback = (chainId: ChainId) => {
  const initialFallbackState = useMemo(
    () => !isSwapApiEnabledChainId(chainId),

    [chainId],
  )

  const [isFallback, setIsFallback] = useState(initialFallbackState)

  const resetFallback = useCallback(() => {
    setIsFallback(initialFallbackState)
  }, [initialFallbackState])

  return {
    isFallback,
    setIsFallback,
    resetFallback,
  }
}

const useTwapSwapTrade = () => {
  const log = useLogger()
  const {
    state: {
      token0,
      chainId,
      token1,
      recipient,
      tokenTax,
      forceClient,
    },
    mutate: { setTokenTax },
  } = useDerivedStateTwapSwap()

  const { isFallback, setIsFallback, resetFallback } = useFallback(chainId)

  const [slippagePercent] = useSlippageTolerance()
  const [carbonOffset] = useCarbonOffset()
  const { data: gasPrice } = useGasPrice({ chainId })

  const useSwapApi = !isFallback && !forceClient

  const adjustedSlippage = useMemo(
    () => (tokenTax ? slippagePercent.add(tokenTax) : slippagePercent),
    [slippagePercent, tokenTax],
  )

  const amount = tryParseAmount('1', token0)
  const apiTrade = useApiTrade({
    chainId,
    fromToken: token0,
    toToken: token1,
    amount,
    slippagePercentage: adjustedSlippage.toFixed(2),
    gasPrice,
    recipient: recipient as Address,
    enabled: Boolean(useSwapApi && amount?.greaterThan(ZERO)),
    carbonOffset,
    onError: () => {
      log.error('api trade error')
      setIsFallback(true)
    },
    tokenTax,
  })

  const clientTrade = useClientTrade({
    chainId,
    fromToken: token0,
    toToken: token1,
    amount,
    slippagePercentage: adjustedSlippage.toFixed(2),
    gasPrice,
    recipient: recipient as Address,
    enabled: Boolean(!useSwapApi && amount?.greaterThan(ZERO)),
    carbonOffset,
    onError: () => {
      log.error('client trade error')
    },
    tokenTax,
  })

  const config = useConfig()

  // Reset the fallback on network switch
  useEffect(() => {
    const unwatch = watchChainId(config, {
      onChange: (newChainId) => {
        if (newChainId) {
          resetFallback()
        }
      },
    })
    return () => unwatch()
  }, [config, resetFallback])

  // Write the useSwapApi value to the window object so it can be logged to GA
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.useSwapApi = useSwapApi
    }
  }, [useSwapApi])

  // Reset tokenTax when token0 or token1 changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    setTokenTax(undefined)
  }, [token0, token1, setTokenTax])

  return useSwapApi ? apiTrade : clientTrade
}

export {
  DerivedstateTwapSwapProvider,
  useDerivedStateTwapSwap,
  useFallback,
  useTwapSwapTrade,
}



const useParsedToken = (token?: Type) => {
 return  useMemo((): Token | undefined => {
    if(!token || !token.wrapped) return
    return {
      address: token.wrapped?.address,
      symbol: token.wrapped?.symbol || '',
      logoUrl: '',
      decimals: token?.wrapped?.decimals,

    }
  }, [token])
}



const useLimitPrice = () => {
  const {state: { typedlimitPrice }}  =useDerivedStateTwapSwap()
  const {isLoading, data} = useTwapSwapTrade()
  const marketPrice  = data?.amountOut?.quotient.toString()
  const typedLimitPriceString = typedlimitPrice?.numerator.toString()
  const {isLimit} = useDerivedStateTwapSwap()

  return useMemo(() => {
    return {
      limitPrice: isLimit ? marketPrice : typedLimitPriceString,
      isLoading: isLoading,
    }
  }, [isLimit, marketPrice, typedLimitPriceString, isLoading])

}

export const useDstTokenAmount = () => {
  const { state: { swapAmountString, token1 } } = useDerivedStateTwapSwap()
  const {limitPrice, isLoading } = useLimitPrice()

  return useMemo(() => {
    const amount = getDstTokenAmount(swapAmountString, limitPrice)
    return {
      isLoading,
      amount: token1 && amount ? Amount.fromRawAmount(token1, amount) : undefined
    }
  }, [swapAmountString, limitPrice, isLoading, token1 ])
}


export const useSrcToken = () => {
  const {state: {token0}} = useDerivedStateTwapSwap()
  return useParsedToken(token0)
}

export const useDstToken = () => {
  const {state: {token1}} = useDerivedStateTwapSwap()
  return useParsedToken(token1)
}
const useToken0UsdPrice = () => {
  const {state: {token0}} = useDerivedStateTwapSwap()
  const { data: price } = usePrice({
    chainId: token0?.chainId,
    address: token0?.wrapped?.address,
    enabled: true,
  })

  return price
}

export const useMaxPossibleChunks = () => {
  const {twapConfig, state:{ swapAmountString }} = useDerivedStateTwapSwap()
  const price = useToken0UsdPrice()?.toSignificant(6)

  return useMemo(() => {
    return getMaxPossibleChunks(twapConfig, swapAmountString, price)
  }, [twapConfig, swapAmountString, price])
}

export const useChunks = () => {
  const {isLimit, state:{typedChunks}} = useDerivedStateTwapSwap()
  const maxPossibleChunks = useMaxPossibleChunks()

  return useMemo(() => {
    return getChunks(maxPossibleChunks, typedChunks, isLimit)
  }, [maxPossibleChunks, typedChunks, isLimit])
}


const useMinDuration = () => {
  const chunks = useChunks()
  const fillDelay = useFillDelay()
  return useMemo(() => {
    return getMinDuration(chunks, fillDelay.millis)
  }, [chunks, fillDelay])
}


export const useFillDelay = () => {
  const {isLimit, state: { typedFillDelay} } = useDerivedStateTwapSwap()

  return useMemo(() => {
    return getFillDelay(isLimit, typedFillDelay)
  }, [isLimit, typedFillDelay])
}

export const useSrcChunksAmount = () => {
  const {state: {swapAmountString}} = useDerivedStateTwapSwap()
  const chunks = useChunks()

  return useMemo(() => {
    return getSrcChunkAmount(swapAmountString, chunks)
  }, [swapAmountString, chunks])
}

export const useSrcChunksAmountUsd = () => {
  const srcChunkAmount = useSrcChunksAmount()
  const price = useToken0UsdPrice()?.toSignificant(6)

  return useMemo(() => {
    return getSrcChunkAmountUsd(srcChunkAmount, price)
  }, [srcChunkAmount, price])
}


const useDuration =   () => {
  const minDuration = useMinDuration()
  const {state: {typedDuration}} = useDerivedStateTwapSwap()

  return useMemo(() => {
    if(!minDuration) return
    return getDuration(minDuration.duration, typedDuration)
  }, [minDuration, typedDuration])
}




export const useDstTokenMinAmount = () => {
  const srcChunkAmount = useSrcChunksAmount()
  const srcToken = useSrcToken()
  const dstToken = useDstToken()

  return useMemo(() => {
    return getDstTokenMinAmount(srcToken, dstToken, srcChunkAmount )
  }, [srcToken, dstToken])
}


export const useDeadline = () => {
  const duration = useDuration()

  return useMemo(() => {
    return getDeadline(duration?.millis || 0)
  }, [duration])
}


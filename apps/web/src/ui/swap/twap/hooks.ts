import { createOrder } from "@orbs-network/twap-sdk"
import { useMutation } from "@tanstack/react-query"
import { useAccount } from "wagmi"
import { useDerivedStateTwapSwap, useDstTokenMinAmount, useSrcChunksAmount, useDeadline, useFillDelay, useSrcToken, useDstToken } from "./derivedstate-twap-swap-provider"

export const useCreateOrder = () => {
    const { address, connector } = useAccount()
    const {twapConfig, state: {swapAmount}} = useDerivedStateTwapSwap()
    const dstTokenMinAmount = useDstTokenMinAmount()
    const srcChunkAmount = useSrcChunksAmount()
    const deadline = useDeadline()
    const fillDelay = useFillDelay()
    const srcToken = useSrcToken()
    const dstToken = useDstToken()
  
    return useMutation({
      mutationFn: async (confirm: () => void) => {
        const provider = await connector?.getProvider()
        if (!provider) throw new Error('No provider')
        if(!address) throw new Error('No address')
        if(!srcToken) throw new Error('No srcToken')
        if(!dstToken) throw new Error('No dstToken')
        if(!swapAmount) throw new Error('No swapAmount')
        confirm()
        const order = await createOrder({
          provider,
          account: address,
          dstTokenMinAmount,
          srcChunkAmount,
          deadlineMillis: deadline,
          fillDelayMillis: fillDelay.millis,
          srcAmount: swapAmount?.numerator.toString(),
          srcTokenAddress: srcToken.address,
          dstTokenAddress: dstToken.address,
          config: twapConfig
        })
  
        console.log('order', order)
        return order
      }
    })
  }
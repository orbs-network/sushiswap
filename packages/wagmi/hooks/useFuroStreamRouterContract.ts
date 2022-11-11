import furoExports from '@sushiswap/furo/exports.json'
import { useContract, useProvider } from 'wagmi'

export const getFuroStreamRouterContractConfig = (chainId: number | undefined) => ({
  address:
    // @ts-ignore
    furoExports[chainId as unknown as keyof Omit<typeof furoExports, '31337'>]?.[0]?.contracts?.FuroStreamRouter
      ?.address ?? '',
  abi:
    // @ts-ignore
    furoExports[chainId as unknown as keyof Omit<typeof furoExports, '31337'>]?.[0]?.contracts?.FuroStreamRouter?.abi ??
    [],
})

export function useFuroStreamRouterContract(chainId: number | undefined) {
  return useContract({
    ...getFuroStreamRouterContractConfig(chainId),
    signerOrProvider: useProvider({ chainId }),
  })
}

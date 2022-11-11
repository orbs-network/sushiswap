import furoExports from '@sushiswap/furo/exports.json'
import { useContract, useProvider } from 'wagmi'

export const getFuroVestingContractConfig = (chainId: number | undefined) => ({
  address:
    furoExports[chainId as unknown as keyof Omit<typeof furoExports, '31337'>]?.[0]?.contracts?.FuroVesting?.address ??
    '',
  abi:
    furoExports[chainId as unknown as keyof Omit<typeof furoExports, '31337'>]?.[0]?.contracts?.FuroVesting?.abi ?? [],
})

export function useFuroVestingContract(chainId: number | undefined) {
  return useContract({
    ...getFuroVestingContractConfig(chainId),
    signerOrProvider: useProvider({ chainId }),
  })
}

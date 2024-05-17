import { useQuery } from "@tanstack/react-query";
import { DEFAULT_TOKEN_LIST } from "src/constants/token-list";
import { getValidTokenAddress, isAddress } from "src/utils/helpers";

type ITokenDataResponse = {
	data: {
		tron: {
			address: [
				{
					smartContract: {
						currency: {
							decimals: number;
							name: string;
							symbol: string;
						};
					};
				}
			];
		};
	};
};

const getTokenData = async ({ contractAddress }: { contractAddress: string }) => {
	try {
		const res = await fetch(`/api/token-info?contractAddress=${contractAddress}`, { method: "GET" });
		if (!res.ok) {
			throw new Error("Failed to fetch data from Tron API");
		}
		const data: ITokenDataResponse | undefined = await res.json();

		const cleanedData = {
			decimals: data?.data?.tron.address[0].smartContract.currency.decimals ?? 0,
			name: data?.data?.tron.address[0].smartContract.currency.name ?? "N/A",
			symbol: data?.data?.tron.address[0].smartContract.currency.symbol ?? "N/A",
		};
		return cleanedData;
	} catch (error) {
		console.log(error);
		return undefined;
	}
};

export const useTokenInfo = ({ tokenAddress }: { tokenAddress: string }) => {
	return useQuery({
		queryKey: ["useTokenInfo2", { tokenAddress }],
		staleTime: Infinity,
		queryFn: async () => {
			if (!isAddress(tokenAddress)) return undefined;
			const foundInTokenList = DEFAULT_TOKEN_LIST.find(
				(i) => getValidTokenAddress(i.address) === getValidTokenAddress(tokenAddress)
			);
			if (foundInTokenList) return foundInTokenList;

			const tokenData = await getTokenData({ contractAddress: tokenAddress });

			return {
				address: tokenAddress,
				decimals: Number(tokenData?.decimals ?? 0),
				name: tokenData?.name ?? "N/A",
				symbol: tokenData?.symbol ?? "N/A",
				logoURI:
					DEFAULT_TOKEN_LIST.find(
						(i) => getValidTokenAddress(i.address) === getValidTokenAddress(tokenAddress)
					)?.logoURI ?? undefined,
			};
		},
		enabled: !!tokenAddress && isAddress(tokenAddress),
	});
};

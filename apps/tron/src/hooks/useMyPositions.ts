import { useQuery } from "@tanstack/react-query";
import { useWallet } from "@tronweb3/tronwallet-adapter-react-hooks";
import { DEFAULT_TOKEN_LIST, TRON } from "src/constants/token-list";
import { getAllPairAddresses } from "src/lib/getAllPairAddresses";
import { IToken } from "src/types/token-type";
import { sortTokenAddresses } from "src/utils/formatters";
import { chunk, flatten, getValidTokenAddress, isAddress } from "src/utils/helpers";

type IPairDataResponse = {
	data: {
		tron: {
			transfers: {
				currency: {
					address: string;
					decimals: number;
					name: string;
					symbol: string;
				};
				txHash: string;
				receiver: {
					address: string;
				};
			}[];
		};
	};
};

const getPairContributions = async ({
	pairAddresses,
	walletAddress,
}: {
	pairAddresses: string[];
	walletAddress: string;
}) => {
	try {
		const res = await fetch(
			`/api/pools/my-positions?pairAddresses=${pairAddresses}&walletAddress=${walletAddress}`,
			{ method: "GET" }
		);
		if (!res.ok) {
			throw new Error("Failed to fetch data from my-positions API");
		}
		const data: IPairDataResponse | undefined = await res.json();

		if (!data?.data?.tron.transfers) return [];
		const groupedData = data?.data?.tron.transfers.reduce(
			(acc, curr) => {
				if (!acc[curr.txHash]) {
					acc[curr.txHash] = [];
				}
				acc[curr.txHash].push({
					currency: curr.currency,
					receiver: curr.receiver.address,
				});
				return acc;
			},
			{} as Record<
				string,
				{
					currency: {
						address: string;
						decimals: number;
						name: string;
						symbol: string;
					};
					receiver: string;
				}[]
			>
		);
		if (!groupedData) return [];

		const groupedDataArray = Object.entries(groupedData).map(([txHash, data]) => {
			const [token0, token1] = sortTokenAddresses(
				data?.[0]?.currency?.address ?? getValidTokenAddress(TRON.address),
				data?.[1]?.currency?.address ?? getValidTokenAddress(TRON.address)
			);
			const pairAddress = data?.[0]?.receiver as string;

			//if token0 or token1 is equal to pairAddress, skip this pair
			if (token0 === pairAddress || token1 === pairAddress) {
				return;
			}

			const _token0: IToken = {
				address: token0,
				decimals: data.find((i) => i?.currency?.address === token0)?.currency?.decimals ?? TRON.decimals,
				name: data.find((i) => i.currency.address === token0)?.currency.name ?? TRON.name,
				symbol: data.find((i) => i.currency.address === token0)?.currency.symbol ?? TRON.symbol,
				logoURI:
					DEFAULT_TOKEN_LIST.find((i) => getValidTokenAddress(i.address) === getValidTokenAddress(token0))
						?.logoURI ?? undefined,
			};
			const _token1: IToken = {
				address: token1,
				decimals: data.find((i) => i.currency.address === token1)?.currency.decimals ?? TRON.decimals,
				name: data.find((i) => i.currency.address === token1)?.currency.name ?? TRON.name,
				symbol: data.find((i) => i.currency.address === token1)?.currency.symbol ?? TRON.symbol,
				logoURI:
					DEFAULT_TOKEN_LIST.find((i) => getValidTokenAddress(i.address) === getValidTokenAddress(token1))
						?.logoURI ?? undefined,
			};
			return {
				token0: _token0,
				token1: _token1,
				pairAddress: pairAddress,
			};
		});
		// //filter out all objects that have duplicate pair addresses or are undefined
		const filteredDataArray = groupedDataArray.filter(
			(v, i, a) => v && a.findIndex((t) => t?.pairAddress === v.pairAddress) === i
		);

		return filteredDataArray;
	} catch (error) {
		console.log(error);
		return [];
	}
};

export const useMyPositions = () => {
	const { address } = useWallet();
	return useQuery({
		queryKey: ["useMyPositions"],
		queryFn: async (data) => {
			if (!address) return [];
			if (!isAddress(address)) return [];
			const allPairs = await getAllPairAddresses();
			//split allPairs into chunks of 100
			const chunkedPairs = chunk(allPairs, 100);
			//get pair contributions for each chunk
			let _result = [];
			for (const chunk of chunkedPairs) {
				//pairAddress  TFXKUwrMw4zRKQZ7KUQaDbNL5zFWincHze
				const _data = await getPairContributions({
					pairAddresses: chunk.map((pair) => pair.pairAddress),
					walletAddress: "TWyK38fWMAjM98GY1ypvHTxj7cQHw7dS66", //TODO: remove hardcoded test address
					// walletAddress: address,
				});
				_result.push(_data);
			}

			return flatten(_result);
		},
		keepPreviousData: true,
		enabled: !!address,
	});
};

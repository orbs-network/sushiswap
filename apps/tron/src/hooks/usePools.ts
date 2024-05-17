import { useQuery } from "@tanstack/react-query";
import { FACTORY_CONTRACT } from "src/constants/contracts";
import { IPoolDataResponse } from "src/types/get-pools-type";
import { flatten } from "../utils/helpers";
import { useTronWeb } from "./useTronWeb";
// import { TRON_MULTICALL_ABI } from "../constants/abis/tron-multicall";
// import { utils, Contract } from "ethers";
// import { PAIR_ABI } from "src/constants/abis/pair-abi";

const getPoolsByEvent = async ({ contractAddress }: { contractAddress: string }) => {
	try {
		const res = await fetch(`/api/pools?contractAddress=${contractAddress}`, { method: "GET" });
		if (!res.ok) {
			throw new Error("Failed to fetch data from Tron API");
		}
		const data: IPoolDataResponse | undefined = await res.json();
		//index 0 will be token0, index 1 will be token1, index 2 will be pair address, and index 3 will be all pairs created length
		//this will repeat in the arguments array
		//group together an object of token0, token1, and pair address. the length of the arguments array is unknown length, and will be divisible by 4
		const cleanedData = data?.data?.tron.smartContractEvents.map((event) => {
			const poolData = event.arguments.reduce(
				(acc: { token0Address: string; token1Address: string; pairAddress: string }[], curr, index) => {
					if (index % 4 === 0) {
						acc.push({
							token0Address: curr.value,
							token1Address: event.arguments[index + 1].value,
							pairAddress: event.arguments[index + 2].value,
						});
					}
					return acc;
				},
				[]
			);

			return poolData;
		});

		const flattenedData = flatten(cleanedData ?? []);

		return flattenedData;
	} catch (error) {
		console.log(error);
		return [];
	}
};
// const abi = [
// 	{
// 		constant: true,
// 		inputs: [],
// 		name: "getReserves",
// 		outputs: [
// 			{ internalType: "uint112", name: "_reserve0", type: "uint112" },
// 			{ internalType: "uint112", name: "_reserve1", type: "uint112" },
// 			{ internalType: "uint32", name: "_blockTimestampLast", type: "uint32" },
// 		],
// 		payable: false,
// 		stateMutability: "view",
// 		type: "function",
// 	},
// ];

export const usePools = () => {
	const { tronWeb } = useTronWeb();
	return useQuery({
		queryKey: ["usePools"],
		queryFn: async () => {
			if (!tronWeb) return [];
			const pools = await getPoolsByEvent({ contractAddress: FACTORY_CONTRACT });
			//TODO: figure out why multicall throws from: cannot encode object for signature with missing names

			// const multicall = await tronWeb.contract(TRON_MULTICALL_ABI, "TGXuuKAb4bnrn137u39EKbYzKNXvdCes98");

			// const calls = pools.map((pool) => {
			// 	const callData = new utils.Interface(abi).encodeFunctionData("getReserves", []);
			// 	// const callData = tronWeb.utils.abi.encodeParamsV2ByABI(abi, []);
			// 	console.log("Encoded Call Data:", callData); // Log encoded call data
			// 	return {
			// 		target: pool.pairAddress,
			// 		callData: callData,
			// 	};
			// });
			// console.log("Calls:", calls); // Log calls
			// const reserves = await multicall.aggregate(calls).call();
			// console.log(reserves);

			return pools;
		},
		keepPreviousData: true,
		enabled: !!tronWeb,
	});
};

import { useQuery } from "@tanstack/react-query";
import { FACTORY_CONTRACT } from "src/constants/contracts";
import { IPoolDataResponse } from "src/types/get-pools-type";
import { flatten, getBase58Address, chunk } from "../utils/helpers";
import { useTronWeb } from "./useTronWeb";
import { TRON_MULTICALL_ABI } from "../constants/abis/tron-multicall";
import { ethers } from "ethers";

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
				(
					acc: {
						token0Address: string;
						token1Address: string;
						pairAddress: string;
						reserve0: string;
						reserve1: string;
					}[],
					curr,
					index
				) => {
					if (index % 4 === 0) {
						acc.push({
							token0Address: curr.value,
							token1Address: event.arguments[index + 1].value,
							pairAddress: event.arguments[index + 2].value,
							reserve0: "0",
							reserve1: "0",
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

export const usePools = () => {
	const { tronWeb } = useTronWeb();
	return useQuery({
		queryKey: ["usePools"],
		queryFn: async () => {
			if (!tronWeb) return [];
			const pools = await getPoolsByEvent({ contractAddress: FACTORY_CONTRACT });
			const _pools = [...pools];

			const multicallAddress = "TGXuuKAb4bnrn137u39EKbYzKNXvdCes98";
			tronWeb.setAddress(multicallAddress);
			const multicall = await tronWeb.contract(TRON_MULTICALL_ABI, multicallAddress);

			//loop through all the pools and get the reserves in chunks so the tron vm doesn't timeout
			//TODO: find way to optimize this so the user isnt waiting so long
			for (const chunkedPools of chunk(_pools, 10)) {
				const calls = chunkedPools.map((pool) => {
					return [
						pool.pairAddress,
						"0x0902f1ac", //getReserves encoded
					];
				});

				const _multicallReturn = await multicall.aggregate(calls).call();
				const { returnData } = _multicallReturn;
				for (let i = 0; i < returnData.length; i++) {
					const decoded = ethers.utils.defaultAbiCoder.decode(
						["uint112", "uint112", "uint32"],
						returnData[i]
					);
					const _reserve0 = decoded[0].toString();
					const _reserve1 = decoded[1].toString();
					//add the reserves to the pool object with the pair address as the key
					const pool = _pools.find(
						(pool) => getBase58Address(pool.pairAddress) === getBase58Address(calls[i][0])
					);
					if (pool) {
						pool.reserve0 = _reserve0;
						pool.reserve1 = _reserve1;
					}
				}
			}

			return _pools;
		},
		keepPreviousData: true,
		enabled: !!tronWeb,
	});
};

import { FACTORY_CONTRACT } from "src/constants/contracts";
import { IPoolDataResponse } from "src/types/get-pools-type";

export const getAllPairAddresses = async () => {
	try {
		const res = await fetch(`/api/pools?contractAddress=${FACTORY_CONTRACT}`, { method: "GET" });
		if (!res.ok) {
			throw new Error("Failed to fetch data from Tron API");
		}
		const data: IPoolDataResponse | undefined = await res.json();
		//index 0 will be token0, index 1 will be token1, index 2 will be pair address, and index 3 will be all pairs created length
		//this will repeat in the arguments array
		//group together an object of token0, token1, and pair address. the length of the arguments array is unknown length, and will be divisible by 4
		const cleanedData = data?.data?.tron.smartContractEvents.map((event) => {
			const poolData = event.arguments.reduce((acc: { pairAddress: string }[], curr, index) => {
				if (index % 4 === 0) {
					acc.push({
						pairAddress: event.arguments[index + 2].value,
					});
				}
				return acc;
			}, []);
			return poolData;
		});

		return cleanedData?.flatMap((pool) => pool) ?? [];
	} catch (error) {
		console.log(error);
		return [];
	}
};

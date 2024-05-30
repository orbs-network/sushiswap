import { FACTORY_CONTRACT } from "src/constants/contracts";
import { IPoolDataResponse } from "src/types/get-pools-type";

export const getAllPairAddresses = async () => {
	try {
		const res = await fetch(`/api/pools?factoryAddress=${FACTORY_CONTRACT}`, { method: "GET" });
		if (!res.ok) {
			throw new Error("Failed to fetch data from Tron API");
		}
		const data: IPoolDataResponse | undefined = await res.json();

		const cleanedData = data?.data?.tron.smartContractEvents.map((event) => {
			const pairAddress = event.arguments.find((arg) => arg.argument === "pair")?.value ?? "";

			return {
				pairAddress,
			};
		});
		if (!cleanedData) return [];

		return cleanedData;
	} catch (error) {
		console.log(error);
		return [];
	}
};

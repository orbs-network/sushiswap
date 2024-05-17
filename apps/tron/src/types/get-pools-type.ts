import { IToken } from "./token-type";

export type IPoolData = {
	token0Address: string;
	token1Address: string;
	pairAddress: string;
}[];

export type IPoolDataResponse = {
	data: {
		tron: {
			smartContractEvents: [
				{
					arguments: {
						argument: string;
						value: string;
					}[];
				}
			];
		};
	};
};

export type IMyPositionData = {
	token0: IToken | undefined;
	token1: IToken | undefined;
	pairAddress: string | undefined;
};

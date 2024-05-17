export type IToken = {
	address: string;
	decimals: number;
	logoURI?: string;
	name: string;
	symbol: string;
};

export type IReserves = {
	reserve: string;
	address?: string | undefined;
	decimals?: number | undefined;
	logoURI?: string | undefined;
	name?: string | undefined;
	symbol?: string | undefined;
};

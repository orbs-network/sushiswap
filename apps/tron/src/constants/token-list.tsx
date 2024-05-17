import { IToken } from "src/types/token-type";
import { IS_TESTNET } from "./is-testnet";

export const TRON: IToken = {
	address: "TRON",
	decimals: 6,
	logoURI:
		"https://static.tronscan.org/production/upload/logo/TNUC9Qb1rRpS5CbWLmNMxXBjyFoydXjWFR.png?t=1598430824415",
	name: "TRX (TRON)",
	symbol: "TRX",
};

const MAINNET_TOKENS: IToken[] = [
	{
		address: "TRON",
		decimals: 6,
		logoURI:
			"https://static.tronscan.org/production/upload/logo/TNUC9Qb1rRpS5CbWLmNMxXBjyFoydXjWFR.png?t=1598430824415",
		name: "TRX (TRON)",
		symbol: "TRX",
	},
	{
		address: "TNUC9Qb1rRpS5CbWLmNMxXBjyFoydXjWFR",
		decimals: 6,
		logoURI:
			"https://static.tronscan.org/production/upload/logo/TNUC9Qb1rRpS5CbWLmNMxXBjyFoydXjWFR.png?t=1598430824415",
		name: "Wrapped TRX",
		symbol: "WTRX",
	},
	{
		address: "TEkxiTehnzSmSe2XqrBj4w32RUN966rdz8",
		decimals: 6,
		logoURI: "https://static.tronscan.org/production/upload/logo/TEkxiTehnzSmSe2XqrBj4w32RUN966rdz81.png",
		name: "USDC Coin",
		symbol: "USDC",
	},
	{
		address: "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t",
		decimals: 6,
		logoURI: "https://static.tronscan.org/production/logo/usdtlogo.png",
		name: "Tether USD",
		symbol: "USDT",
	},
	{
		address: "TXWkP3jLBqRGojUih1ShzNyDaN5Csnebok",
		decimals: 18,
		logoURI: "https://static.tronscan.org/production/logo/TXWkP3jLBqRGojUih1ShzNyDaN5Csnebok.png",
		name: "Wrapped ETH",
		symbol: "WETH",
	},
];

const TESTNET_TOKENS: IToken[] = [
	{
		address: "TRON",
		decimals: 6,
		logoURI:
			"https://static.tronscan.org/production/upload/logo/TNUC9Qb1rRpS5CbWLmNMxXBjyFoydXjWFR.png?t=1598430824415",
		name: "TRX (TRON)",
		symbol: "TRX",
	},
	{
		address: "TNUC9Qb1rRpS5CbWLmNMxXBjyFoydXjWFR", //mainnet address currently
		decimals: 6,
		logoURI:
			"https://static.tronscan.org/production/upload/logo/TNUC9Qb1rRpS5CbWLmNMxXBjyFoydXjWFR.png?t=1598430824415",
		name: "Wrapped TRX",
		symbol: "WTRX",
	},
	{
		address: "TSdZwNqpHofzP6BsBKGQUWdBeJphLmF6id",
		decimals: 6,
		logoURI: "https://static.tronscan.org/production/upload/logo/TEkxiTehnzSmSe2XqrBj4w32RUN966rdz81.png",
		name: "USDC Coin",
		symbol: "USDC",
	},
];

export const DEFAULT_TOKEN_LIST = IS_TESTNET ? TESTNET_TOKENS : MAINNET_TOKENS;

export const DEFAULT_TOKEN_LIST_WITH_KEY = () => {
	return DEFAULT_TOKEN_LIST.reduce<Record<string, IToken>>(
		(acc, { address, decimals, name, symbol, logoURI }) => {
			acc[address] = {
				name,
				decimals,
				symbol,
				address,
				logoURI,
			};
			return acc;
		},
		{}
	);
};

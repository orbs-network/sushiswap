import { DEFAULT_TOKEN_LIST } from "src/constants/token-list";
import TronWeb from "tronweb";

export const isAddress = (address: string): boolean => {
	if (!address) return false;
	return TronWeb.isAddress(address);
};

export const getValidTokenAddress = (address: string): string => {
	let _tokenAddress = address;
	if (address === "TRON") {
		_tokenAddress = DEFAULT_TOKEN_LIST.find((token) => token.symbol === "WTRX")?.address as string;
	}
	return _tokenAddress;
};

export const getBase58Address = (address: string): string => {
	return TronWeb.address.fromHex(address);
};

export const getHexAddress = (address: string): string => {
	return TronWeb.address.toHex(address);
};

export const chunk = <T>(arr: T[], chunkSize: number): T[][] => {
	return Array.from({ length: Math.ceil(arr.length / chunkSize) }, (_, i) =>
		arr.slice(i * chunkSize, i * chunkSize + chunkSize)
	);
};

export const flatten = <T>(arr: T[][]): T[] => {
	return arr.flat();
};

export const chunkAndFlatten = <T>(arr: T[], chunkSize: number): T[] => {
	const chunked = chunk(arr, chunkSize);
	return flatten(chunked);
};

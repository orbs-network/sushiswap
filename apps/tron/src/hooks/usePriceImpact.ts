import { useTronWeb } from "./useTronWeb";
import { useQuery } from "@tanstack/react-query";
import { IReserves, IToken } from "src/types/token-type";
import { parseUnits } from "src/utils/formatters";
import { getValidTokenAddress, isAddress } from "src/utils/helpers";

const calculatePriceImpact = ({
	initialReserve0,
	initialReserve1,
	tokenAmount0,
}: {
	initialReserve0: number;
	initialReserve1: number;
	tokenAmount0: number;
}): number => {
	const k = initialReserve0 * initialReserve1; // Constant product
	const newReserveX = initialReserve0 + tokenAmount0; // Updated reserve of token X
	const newReserveY = k / newReserveX; // Updated reserve of token Y using constant product formula
	const receivedTokenY = initialReserve1 - newReserveY; // Amount of token Y received
	const priceImpact = (receivedTokenY / newReserveY) * 100; // Price impact percentage
	return priceImpact;
};
export const usePriceImpact = ({
	amountIn,
	token0,
	reserves,
}: {
	amountIn: string;
	token0: IToken;
	reserves: IReserves[] | undefined;
}) => {
	const { tronWeb } = useTronWeb();

	return useQuery({
		queryKey: ["usePriceImpact", { reserves, token0, amountIn }],
		queryFn: async () => {
			const priceImpactPercentage = calculatePriceImpact({
				initialReserve0: Number(reserves?.[0].reserve),
				initialReserve1: Number(reserves?.[1].reserve),
				tokenAmount0: Number(parseUnits(amountIn, token0.decimals)),
			});

			return priceImpactPercentage;
		},
		enabled:
			!!amountIn &&
			!!token0 &&
			!!reserves?.[0]?.address &&
			!!reserves?.[1]?.address &&
			isAddress(getValidTokenAddress(token0?.address)) &&
			isAddress(getValidTokenAddress(reserves?.[0]?.address)) &&
			isAddress(getValidTokenAddress(reserves?.[1]?.address)) &&
			!!tronWeb,
	});
};

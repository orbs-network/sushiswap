import { useTronWeb } from "./useTronWeb";
import { useQuery } from "@tanstack/react-query";
import TronWeb from "tronweb";
import { ROUTER_CONTRACT } from "src/constants/contracts";
import { getValidTokenAddress } from "src/utils/helpers";

export const useAmountsOut = ({
	amountIn,
	token0Address,
	token1Address,
}: {
	amountIn: string;
	token0Address: string;
	token1Address: string;
}) => {
	const { tronWeb } = useTronWeb();

	return useQuery({
		queryKey: ["useAmountsOut", { token0Address, token1Address, amountIn }],
		queryFn: async () => {
			let _token0Address = getValidTokenAddress(token0Address);
			let _token1Address = getValidTokenAddress(token1Address);

			if (_token0Address === _token1Address) return [amountIn, amountIn];

			if (!amountIn || isNaN(Number(amountIn))) return [];
			tronWeb.setAddress(ROUTER_CONTRACT);
			try {
				const routerContract = await tronWeb.contract().at(ROUTER_CONTRACT);
				const amountsOuts = await routerContract
					.getAmountsOut(amountIn, [_token0Address, _token1Address])
					.call();

				return amountsOuts?.amounts?.map((i: typeof TronWeb.BigNumber) => i.toString()) as string[];
			} catch (error) {
				return [amountIn, ""];
			}
		},
		enabled: !!amountIn && !!token0Address && !!token1Address && !!tronWeb,
	});
};

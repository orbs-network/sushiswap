import { formatUSD } from "sushi/format";
import { IRowData } from "./PoolsTable";

export const PoolTvlCell = ({ data }: { data: IRowData }) => {
	// const { token0Address, token1Address, reserve0, reserve1 } = data;
	// const { data: token0Data, isLoading: isLoadingToken0 } = useTokenInfo({
	// 	tokenAddress: getBase58Address(token0Address),
	// });

	// const { data: token1Data, isLoading: isLoadingToken1 } = useTokenInfo({
	// 	tokenAddress: getBase58Address(token1Address),
	// });

	// if (isLoadingToken0 || isLoadingToken1) {
	// 	return <SkeletonText fontSize="lg" />;
	// }

	// const token0Price = useStablePrice({ token: token0Data }) ?? 0
	// const token1Price = useStablePrice({ token: token1Data }) ?? 0

	// const reserve0Usd = token0Price * (Number(reserve0) / 10 ** token0Data.decimals)
	// const reserve1Usd = token1Price * (Number(reserve1) / 10 ** token1Data.decimals)

	// const poolTvl = reserve0Usd + reserve1Usd

	return (
		<div className="flex items-center gap-1">
			<div className="flex flex-col gap-0.5">
				<span className="flex items-center gap-1 text-sm font-medium text-gray-900 dark:text-slate-50">
					{formatUSD(data?.tvl)}
				</span>
			</div>
		</div>
	);
};

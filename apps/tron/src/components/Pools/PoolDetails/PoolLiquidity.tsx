import { formatUSD, formatNumber } from "sushi/format";
import { List, SkeletonCircle, SkeletonText } from "@sushiswap/ui";
import { Icon } from "src/components/General/Icon";
import { IToken } from "src/types/token-type";
import { useReserves } from "src/hooks/useReserves";
import { formatUnits } from "src/utils/formatters";

export const PoolLiquidity = ({
	token0,
	token1,
	isLoading,
	pairAddress,
}: {
	token0: IToken | undefined;
	token1: IToken | undefined;
	isLoading: boolean;
	pairAddress: string;
}) => {
	const token0PoolPrice = "?";
	const token1PoolPrice = "?";
	const { data, isLoading: isLoadingReserves } = useReserves({ pairAddress, token0, token1 });

	return (
		<List>
			<div className="flex items-center justify-between">
				<List.Label>Pool Liquidity</List.Label>
				<List.Label>{formatUSD(token0PoolPrice + token1PoolPrice)}</List.Label>
			</div>
			<List.Control>
				{isLoading || isLoadingReserves ? (
					<div className="flex flex-col gap-2 p-4">
						<div className="flex justify-between">
							<SkeletonText className="!w-10" />
							<div className="flex items-center gap-2">
								<SkeletonCircle radius={18} />
								<SkeletonText className="!w-10" />
								<SkeletonText className="!w-10" />
							</div>
						</div>
						<div className="flex justify-between">
							<SkeletonText className="!w-10" />
							<div className="flex items-center gap-2">
								<SkeletonCircle radius={18} />
								<SkeletonText className="!w-10" />
								<SkeletonText className="!w-10" />
							</div>
						</div>
					</div>
				) : (
					<>
						<List.KeyValue flex title={`${token0?.symbol}`}>
							<div className="flex items-center gap-2">
								<Icon currency={token0} width={18} height={18} />
								{formatNumber(formatUnits(data?.[0]?.reserve ?? "", token0?.decimals ?? 0, 4))}{" "}
								{" " + token0?.symbol}
								<span className="text-gray-600 dark:text-slate-400">({formatUSD(token0PoolPrice)})</span>
							</div>
						</List.KeyValue>

						<List.KeyValue flex title={`${token1?.symbol}`}>
							<div className="flex items-center gap-2">
								<Icon currency={token1} width={18} height={18} />
								{formatNumber(formatUnits(data?.[1]?.reserve ?? "", token1?.decimals ?? 0, 4))}{" "}
								{" " + token1?.symbol}
								<span className="text-gray-600 dark:text-slate-400">({formatUSD(token1PoolPrice)})</span>
							</div>
						</List.KeyValue>
					</>
				)}
			</List.Control>
		</List>
	);
};

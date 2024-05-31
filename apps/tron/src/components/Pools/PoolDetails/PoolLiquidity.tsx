import { formatUSD, formatNumber } from "sushi/format";
import { List, SkeletonCircle, SkeletonText } from "@sushiswap/ui";
import { Icon } from "src/components/General/Icon";
import { IToken } from "src/types/token-type";
import { useReserves } from "src/hooks/useReserves";
import { formatUnits, formatUnitsForInput } from "src/utils/formatters";
import { useStablePrice } from "src/hooks/useStablePrice";

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
	const { data, isLoading: isLoadingReserves } = useReserves({ pairAddress, token0, token1 });

	const reserve0 = data?.[0]?.reserve ?? "0";
	const reserve0Formatted = formatUnitsForInput(reserve0, token0?.decimals ?? 0);

	const reserve1 = data?.[1]?.reserve ?? "0";
	const reserve1Formatted = formatUnitsForInput(reserve1, token1?.decimals ?? 0);

	const { data: token0Price } = useStablePrice({ token: token0 });
	const { data: token1Price } = useStablePrice({ token: token1 });

	const token0PoolPrice = (Number(token0Price) * Number(reserve0Formatted)).toString(10);
	const token1PoolPrice = (Number(token1Price) * Number(reserve1Formatted)).toString(10);

	return (
		<List>
			<div className="flex items-center justify-between">
				<List.Label>Pool Liquidity</List.Label>
				<List.Label>{formatUSD(Number(token0PoolPrice) + Number(token1PoolPrice))}</List.Label>
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

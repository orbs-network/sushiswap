import { SkeletonText, classNames } from "@sushiswap/ui";
import { Icon } from "../../General/Icon";
import { IconList } from "@sushiswap/ui/components/currency/IconList";
import { getBase58Address } from "src/utils/helpers";
import { useTokenInfo } from "src/hooks/useTokenInfo";

export const PoolNameCell = ({ data }: { data: { apr: string; name: string } }) => {
	const { name } = data;
	const token0 = name.split("/")?.[0];
	const token1 = name.split("/")?.[1];
	const { data: token0Data, isLoading: isLoadingToken0 } = useTokenInfo({
		tokenAddress: getBase58Address(token0),
	});

	const { data: token1Data, isLoading: isLoadingToken1 } = useTokenInfo({
		tokenAddress: getBase58Address(token1),
	});

	return (
		<div className="flex items-center gap-1">
			<div className="flex min-w-[54px]">
				{token0 && token1 && (
					<IconList iconWidth={26} iconHeight={26}>
						<Icon currency={token0Data} />
						<Icon currency={token1Data} />
					</IconList>
				)}
			</div>
			<div className="flex flex-col gap-0.5">
				<span className="flex items-center gap-1 text-sm font-medium text-gray-900 dark:text-slate-50">
					{isLoadingToken0 ? <SkeletonText className="!w-10" fontSize="default" /> : token0Data?.symbol}
					<span className="font-normal text-gray-900 dark:text-slate-500">/</span>
					{isLoadingToken1 ? <SkeletonText className="!w-10" fontSize="default" /> : token1Data?.symbol}
					<div className={classNames("text-[10px] bg-gray-200 dark:bg-slate-700 rounded-lg px-1 ml-1")}></div>
				</span>
			</div>
		</div>
	);
};

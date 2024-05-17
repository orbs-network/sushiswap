import { SkeletonText } from "@sushiswap/ui";
import { Icon } from "src/components/General/Icon";
import { IToken } from "src/types/token-type";
import { formatNumber, formatUSD } from "sushi/format";

type PoolPositionDetailsProps = {
	isStaked: boolean;
	isLoading: boolean;
	token0: IToken | undefined;
	token1: IToken | undefined;
};

export const PoolPositionDetails = ({ isStaked, isLoading, token0, token1 }: PoolPositionDetailsProps) => {
	if (isLoading) {
		return <Skeleton />;
	}
	return (
		<div className="flex flex-col gap-3 px-5 py-4">
			<div className="flex items-center justify-between mb-1">
				<p className="dark:text-slate-100 text-gray-900 text-sm font-[600]">
					{isStaked ? "Staked" : "Unstaked"}
				</p>
				<p className="dark:text-slate-100 text-gray-900 font-[500] text-xs">{formatUSD("0" + "0")}</p>
			</div>

			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<Icon currency={token0} width={20} height={20} />
					<p className="dark:text-slate-300 text-gray-700 text-sm font-[600]">
						{formatNumber(0)} {token0?.symbol}
					</p>
				</div>
				<p className="dark:text-slate-400 text-slate-600 font-[500] text-xs">{formatUSD("0")}</p>
			</div>
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<Icon currency={token1} width={20} height={20} />
					<p className="dark:text-slate-300 text-gray-700 text-sm font-[600]">
						{formatNumber(0)} {token1?.symbol}
					</p>
				</div>
				<p className="dark:text-slate-400 text-slate-600 font-[500] text-xs">{formatUSD("0")}</p>
			</div>
		</div>
	);
};

const Skeleton = () => {
	return (
		<div className="flex flex-col gap-3 px-5 py-4 w-full">
			<div className="flex justify-between mb-1 py-0.5 w-full">
				<div>
					<SkeletonText className="!w-[100px]" />
				</div>
				<div>
					<SkeletonText className="!w-[60px]" />
				</div>
			</div>
			<div className="flex justify-between py-0.5 w-full">
				<div>
					<SkeletonText className="!w-[160px]" />
				</div>
				<div>
					<SkeletonText className="!w-[60px]" />
				</div>
			</div>
			<div className="flex justify-between py-0.5 w-full">
				<div>
					<SkeletonText className="!w-[160px]" />
				</div>
				<div>
					<SkeletonText className="!w-[60px]" />
				</div>
			</div>
		</div>
	);
};

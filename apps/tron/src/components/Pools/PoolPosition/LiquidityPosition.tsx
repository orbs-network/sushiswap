import { Icon } from "src/components/General/Icon";
import { formatNumber, formatPercent } from "sushi/format";

type LiquidityPositionProps = {
	isLoading: boolean;
};

export const LiquidityPosition = ({ isLoading }: LiquidityPositionProps) => {
	const token0 = { symbol: "TRX" };
	const token1 = { symbol: "USDC" };

	if (isLoading) {
		return <Skeleton />;
	}

	return (
		<div className="flex flex-col gap-2">
			<div className="flex gap-1 justify-between items-center">
				<p className="dark:text-slate-50 text-gray-900 text-sm font-[600]">My Liquidity Position</p>
				<p className="dark:text-slate-400 text-gray-600 text-xs font-[500]">{formatPercent("0")}</p>
			</div>
			<div className="flex flex-col gap-1.5">
				<div className="flex items-center gap-1.5">
					<div className="w-4 h-4">{token0 && <Icon currency={token0} width={16} height={16} />}</div>
					<p className="flex items-center gap-1 dark:text-slate-400 text-gray-600 font-[500] text-xs">
						{formatNumber("0")} {token0?.symbol}
					</p>
				</div>
				<div className="flex items-center gap-1.5">
					<div className="w-4 h-4">{token1 && <Icon currency={token1} width={16} height={16} />}</div>
					<p className="flex items-center gap-1 dark:text-slate-400 text-gray-600 font-[500] text-xs">
						{formatNumber("0")} {token1?.symbol}
					</p>
				</div>
			</div>
		</div>
	);
};

export const Skeleton = () => (
	<div className="flex flex-col gap-2">
		<div className="flex gap-1 justify-between items-center">
			<p className="dark:text-slate-50 text-gray-900 text-sm font-[600]">My Liquidity Position</p>
			<div className="h-[16px] w-[40px] animate-pulse bg-slate-600 rounded-full" />
		</div>
		<div className="flex flex-col gap-1.5">
			<div className="flex justify-between items-center gap-1.5">
				<div className="h-[16px] w-[120px] bg-slate-700 animate-pulse rounded-full" />
				<div className="h-[16px] w-[40px] bg-slate-700 animate-pulse rounded-full" />
			</div>
			<div className="flex justify-between items-center gap-1.5">
				<div className="h-[16px] w-[120px] bg-slate-700 animate-pulse rounded-full" />
				<div className="h-[16px] w-[40px] bg-slate-700 animate-pulse rounded-full" />
			</div>
		</div>
	</div>
);

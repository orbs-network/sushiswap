import { useRemoveLiqState } from "src/app/pool/[poolId]/remove/remove-provider";
import { Icon } from "src/components/General/Icon";
import { formatNumber } from "sushi/format";

export const MinimumReceive = () => {
	const { percentage, token0, token1 } = useRemoveLiqState();
	return (
		<div className="flex flex-col gap-3 border px-5 py-6 dark:bg-slate-800 rounded-2xl bg-white border-gray-900/10 dark:border-slate-200/10">
			<p className="text-xs text-[#6b7280] dark:text-[#94a3b8]">You{'"'}ll receive at least:</p>
			<div className="flex justify-between items-center gap-2">
				<div className="flex items-center gap-2">
					<Icon currency={token0} width={20} height={20} />
					<div className="text-sm">{token0?.symbol}</div>
				</div>
				<div className="text-sm font-[600]"> {formatNumber(percentage * 10)}</div>
			</div>
			<div className="flex justify-between items-center gap-2">
				<div className="flex items-center gap-2">
					<Icon currency={token1} width={20} height={20} />
					<div className="text-sm">{token1?.symbol}</div>
				</div>
				<div className="text-sm font-[600]"> {formatNumber(percentage * 100)}</div>
			</div>
		</div>
	);
};

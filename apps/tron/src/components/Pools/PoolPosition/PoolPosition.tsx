import { formatUSD } from "sushi/format";
import { PoolPositionDetails } from "./PoolPositionDetails";

export const PoolPosition = () => {
	const token0UnstakedInUsd = 0;
	const token1UnstakedInUsd = 0;
	const token0StakedInUsd = 0;
	const token1StakedInUsd = 0;

	return (
		<div className="flex flex-col dark:bg-slate-800 rounded-2xl bg-white">
			<div className="flex items-center justify-between px-5 py-4 border-b border-gray-900/5 dark:border-slate-200/5">
				<p className="text-gray-900 dark:text-slate-50 font-[600]">My Position</p>
				<div className="flex flex-col">
					<p className="text-sm font-[600] text-right dark:text-slate-50 text-gray-900">
						{formatUSD(token0StakedInUsd + token1StakedInUsd + token0UnstakedInUsd + token1UnstakedInUsd)}
					</p>
				</div>
			</div>
			<PoolPositionDetails isStaked={false} isLoading={false} />
			<PoolPositionDetails isStaked={true} isLoading={false} />
		</div>
	);
};

import { formatUSD } from "sushi/format";

export const PositionSizeCell = () => {
	return (
		<div className="flex items-center gap-1">
			<div className="flex flex-col gap-0.5">
				<span className="flex items-center gap-1 text-sm font-medium text-gray-900 dark:text-slate-50">
					{formatUSD(0)}
				</span>
			</div>
		</div>
	);
};

import { classNames } from "@sushiswap/ui";
import { Icon } from "../../General/Icon";
import { IconList } from "@sushiswap/ui/components/currency/IconList";

export const PoolNameCell = () => {
	const token0 = "token0";
	const token1 = "token1";

	return (
		<div className="flex items-center gap-1">
			<div className="flex min-w-[54px]">
				{token0 && token1 && (
					<IconList iconWidth={26} iconHeight={26}>
						<Icon currency={token0} />
						<Icon currency={token1} />
					</IconList>
				)}
			</div>
			<div className="flex flex-col gap-0.5">
				<span className="flex items-center gap-1 text-sm font-medium text-gray-900 dark:text-slate-50">
					{token0} <span className="font-normal text-gray-900 dark:text-slate-500">/</span> {token1}{" "}
					<div className={classNames("text-[10px] bg-gray-200 dark:bg-slate-700 rounded-lg px-1 ml-1")}></div>
				</span>
			</div>
		</div>
	);
};

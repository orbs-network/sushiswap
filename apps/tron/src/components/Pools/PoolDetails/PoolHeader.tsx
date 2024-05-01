import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/solid";
import { IconList } from "@sushiswap/ui/components/currency/IconList";
import Link from "next/link";
import { Icon } from "src/components/General/Icon";

export const PoolHeader = () => {
	const token0 = { symbol: "TRX" };
	const token1 = { symbol: "USDC" };

	return (
		<div className="flex flex-col gap-5">
			<div className="flex flex-col gap-3">
				<div className="flex flex-col gap-6 sm:flex-row sm:justify-between sm:items-center">
					<div className="flex gap-2 items-center">
						<IconList iconWidth={44} iconHeight={44}>
							<Icon currency={"token0"} />
							<Icon currency={"token1"} />
						</IconList>
						<Link
							className="flex flex-col !no-underline group"
							target="_blank"
							rel="noopener noreferrer"
							// placeholder till pair contract created then will make util to get link
							href={`https://tronscan.org/#/token20/TEkxiTehnzSmSe2XqrBj4w32RUN966rdz8`}>
							<div className="flex items-center gap-2">
								<p className="flex items-center gap-1 text-gray-900 font-[600] dark:text-slate-50 group-hover:text-blue-400">
									{token0?.symbol} / {token1.symbol}
									<ArrowTopRightOnSquareIcon height={20} width={20} />
								</p>
							</div>
							<p className="text-gray-600 dark:text-slate-300 text-xs">Fee: {"0.00%"}</p>
						</Link>
					</div>
					<div className="flex flex-col gap-1">
						<span className="text-gray-500 dark:text-slate-400 sm:text-right">
							APR: <span className="font-semibold text-gray-900 dark:text-slate-50">{"0.00%"}</span>
						</span>
						<div className="flex gap-2 text-xs">
							<p className="text-gray-600 dark:text-slate-400">Rewards: {"0.00%"}</p>

							<p className="text-gray-600 dark:text-slate-400">Fees: {"0.00%"}</p>
						</div>
					</div>
				</div>
			</div>
			<div className="flex flex-col gap-3 md:flex-row w-full text-sm font-[600]">
				<div className="flex w-full gap-3 p-3 bg-white rounded-lg dark:bg-slate-800">
					<Icon currency={token0} width={20} height={20} />
					<p className="text-gray-600 dark:text-slate-300">
						{token0.symbol} = {"$0.00"}
					</p>
				</div>
				<div className="flex w-full gap-3 p-3 bg-white rounded-lg dark:bg-slate-800">
					<Icon currency={token1} width={20} height={20} />
					<p className="text-gray-600 dark:text-slate-300">
						{token1.symbol} = {"$0.00"}
					</p>
				</div>
			</div>
		</div>
	);
};

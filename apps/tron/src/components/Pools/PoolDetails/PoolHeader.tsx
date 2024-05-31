import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/solid";
import { SkeletonCircle, SkeletonText } from "@sushiswap/ui";
import { IconList } from "@sushiswap/ui/components/currency/IconList";
import Link from "next/link";
import { Icon } from "src/components/General/Icon";
import { useStablePrice } from "src/hooks/useStablePrice";
import { IToken } from "src/types/token-type";
import { formatUSD } from "sushi/format";

export const PoolHeader = ({
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
	const { data: token0USD, isLoading: isLoadingToken0USD } = useStablePrice({ token: token0 });
	const { data: token1USD, isLoading: isLoadingToken1USD } = useStablePrice({ token: token1 });
	return (
		<div className="flex flex-col gap-5">
			<div className="flex flex-col gap-3">
				<div className="flex flex-col gap-6 sm:flex-row sm:justify-between sm:items-center">
					<div className="flex gap-2 items-center">
						<IconList iconWidth={44} iconHeight={44}>
							{isLoading ? <SkeletonCircle radius={44} /> : <Icon currency={token0} />}
							{isLoading ? <SkeletonCircle radius={44} /> : <Icon currency={token1} />}
						</IconList>
						<Link
							className="flex flex-col !no-underline group"
							target="_blank"
							rel="noopener noreferrer"
							href={`https://tronscan.org/#/token20/${pairAddress}`}>
							<div className="flex items-center gap-2">
								{isLoading ? (
									<div className="flex gap-2">
										<SkeletonText fontSize="lg" className="!w-10" />
										/
										<SkeletonText fontSize="lg" className="!w-10" />
									</div>
								) : (
									<p className="flex items-center gap-1 text-gray-900 font-[600] dark:text-slate-50 group-hover:text-blue-400">
										{token0?.symbol} / {token1?.symbol}
									</p>
								)}
								<ArrowTopRightOnSquareIcon height={20} width={20} />
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
					{isLoading ? <SkeletonCircle radius={20} /> : <Icon currency={token0} width={20} height={20} />}

					{isLoading || isLoadingToken0USD ? (
						<div className="flex gap-2">
							<SkeletonText className="!w-10" />
							=
							<SkeletonText className="!w-10" />
						</div>
					) : (
						<p className="text-gray-600 dark:text-slate-300">
							{token0?.symbol} = {formatUSD(token0USD ?? "")}
						</p>
					)}
				</div>
				<div className="flex w-full gap-3 p-3 bg-white rounded-lg dark:bg-slate-800">
					{isLoading ? <SkeletonCircle radius={20} /> : <Icon currency={token1} width={20} height={20} />}
					{isLoading || isLoadingToken1USD ? (
						<div className="flex gap-2">
							<SkeletonText className="!w-10" />
							=
							<SkeletonText className="!w-10" />
						</div>
					) : (
						<p className="text-gray-600 dark:text-slate-300">
							{token1?.symbol} = {formatUSD(token1USD ?? "")}
						</p>
					)}
				</div>
			</div>
		</div>
	);
};

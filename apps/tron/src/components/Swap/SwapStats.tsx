import { Transition } from "@headlessui/react";
import { classNames } from "@sushiswap/ui";
import { SkeletonBox, SkeletonText } from "@sushiswap/ui";
// import { TradeRoute } from './TradeRoute'

import { useWallet } from "@tronweb3/tronwallet-adapter-react-hooks";
import Link from "next/link";
import { useSwapState } from "src/app/swap/swap-provider";
import { truncateText } from "src/utils/formatters";
import { getTronscanAddressLink } from "src/utils/tronscan-helpers";
import { warningSeverity, warningSeverityClassName } from "src/utils/warning-severity";
import { SwapRoutesDialog } from "./SwapRoutesDialog";

export const SwapStats = () => {
	const { token1 } = useSwapState();
	const { address } = useWallet();
	const loading = false;
	const outputSwapTokenAmount = "444";

	const minOutput = 443;

	return (
		<Transition
			show={false} //Number(amountIn) > 0 && bestRoutes.length > 0
			enter="transition duration-300 ease-out"
			enterFrom="transform translate-y-[16px] opacity-0"
			enterTo="transform translate-y-0 opacity-100"
			leave="transition duration-300 ease-out"
			leaveFrom="transform translate-y-0 opacity-100"
			leaveTo="transform translate-y-[16px] opacity-0">
			<div className="w-full px-2 flex flex-col gap-1">
				<div className="flex justify-between items-center gap-2">
					<span className="text-sm text-gray-700 dark:text-slate-400">Price impact</span>
					<span
						className={classNames(
							warningSeverityClassName(warningSeverity(0)),
							"text-sm font-semibold text-gray-700 text-right dark:text-slate-400"
						)}>
						{loading ? (
							<SkeletonBox className="h-4 py-0.5 w-[120px] rounded-md" />
						) : (
							<>{0}%</>
							// <>{routes?.priceImpact ? -routes?.priceImpact : 0}%</>
						)}
					</span>
				</div>
				<div className="flex justify-between items-center gap-2">
					<span className="text-sm text-gray-700 dark:text-slate-400">Est. received</span>
					<span className="text-sm font-semibold text-gray-700 text-right dark:text-slate-400">
						{loading || !outputSwapTokenAmount ? (
							<SkeletonText fontSize="text-sm" className="w-[120px]" />
						) : (
							`${outputSwapTokenAmount} TRX`
							// `${outputSwapTokenAmount} ${token1.symbol}`
						)}
					</span>
				</div>
				<div className="flex justify-between items-center gap-2">
					<span className="text-sm text-gray-700 dark:text-slate-400">Min. received</span>
					<span className="text-sm font-semibold text-gray-700 text-right dark:text-slate-400">
						{loading || !minOutput ? (
							<SkeletonText fontSize="text-sm" className="w-[120px]" />
						) : (
							`${minOutput} TRX`
						)}
					</span>
				</div>
				<div className="flex justify-between items-center">
					<span className="text-sm text-gray-700 dark:text-slate-400">Route</span>
					<span className="text-sm font-semibold text-gray-700 text-right dark:text-slate-400">
						{loading ? <SkeletonText fontSize="text-sm" className="w-[120px]" /> : <SwapRoutesDialog />}
					</span>
				</div>
				{address && (
					<div className="flex justify-between items-center border-t border-gray-200 dark:border-slate-200/5 mt-2 pt-2">
						<span className="font-medium text-sm text-gray-700 dark:text-slate-300">Recipient</span>
						<span className="font-semibold text-gray-700 text-right dark:text-slate-400">
							<Link
								target="_blank"
								href={getTronscanAddressLink(address)}
								className={classNames("flex items-center gap-2 cursor-pointer text-blue")}
								rel="noreferrer">
								{truncateText(address)}
							</Link>
						</span>
					</div>
				)}
			</div>
		</Transition>
	);
};

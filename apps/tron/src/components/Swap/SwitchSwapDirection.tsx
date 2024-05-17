import React from "react";
import { ArrowsUpDownIcon } from "@heroicons/react/24/outline";
import { useSwapDispatch } from "src/app/swap/swap-provider";

export const SwitchSwapDirection = () => {
	const { swapTokens } = useSwapDispatch();
	return (
		<div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
			<button
				type="button"
				onClick={swapTokens}
				className="z-10 group bg-gray-100 hover:bg-gray-200 hover:dark:bg-slate-700 dark:bg-slate-900 p-2 border-white transition-all rounded-full cursor-pointer">
				<div className="transition-transform rotate-0 group-hover:rotate-180">
					<ArrowsUpDownIcon strokeWidth={3} className="w-4 h-4 text-blue" />
				</div>
			</button>
		</div>
	);
};

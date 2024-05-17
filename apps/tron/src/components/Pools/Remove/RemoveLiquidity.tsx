"use client";
import { SettingsModule, SettingsOverlay } from "@sushiswap/ui";
import { RemoveInput } from "./RemoveInput";
import { MinimumReceive } from "./MinimumReceive";
import { RemoveButton } from "./RemoveButton";

export const RemoveLiquidity = () => {
	return (
		<div className="flex flex-col gap-4 dark:bg-slate-800 rounded-2xl bg-white px-5 pt-4 pb-6">
			<div className="flex justify-between items-cetner gap-2">
				<div>
					<h3 className="text-gray-900 dark:text-slate-50 font-[600] text-lg">Remove Liquidity</h3>
					<p className="dark:text-slate-400 text-slate-600 text-sm">
						Trade in your LP tokens to receive your underlying tokens
					</p>
				</div>
				<SettingsOverlay
					options={{ slippageTolerance: { storageKey: "sushi-tron-slippage-remove" } }} //use this key to get slippage from localStorage
					modules={[SettingsModule.SlippageTolerance]}
				/>
			</div>
			<RemoveInput />
			<MinimumReceive />
			<RemoveButton />
		</div>
	);
};

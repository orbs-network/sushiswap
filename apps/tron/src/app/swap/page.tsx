"use client";
import { Container, SettingsModule, SettingsOverlay } from "@sushiswap/ui";
import { SwitchSwapType } from "src/components/Swap/SwitchSwapType";
import { SwitchSwapDirection } from "src/components/Swap/SwitchSwapDirection";
import { ReviewSwapDialog } from "src/components/Swap/ReviewSwapDialog";
import { AmountIn } from "src/components/Swap/AmountIn";
import { AmountOut } from "src/components/Swap/AmountOut";

export default function SwapSimplePage() {
	return (
		<Container className="p-4 mx-auto mt-16 mb-[86px] flex flex-col gap-4 max-w-[520px]">
			<h1 className="text-4xl font-medium text-gray-900 dark:text-slate-50 sm:max-h-[44px] mb-4">Trade</h1>
			<section className="flex items-center justify-between">
				<SwitchSwapType />
				<SettingsOverlay
					options={{ slippageTolerance: { storageKey: "sushi-tron-slippage" } }} //use this key to get slippage from localStorage
					modules={[SettingsModule.SlippageTolerance]}
				/>
			</section>
			<section className="flex flex-col gap-4 relative">
				<AmountIn />
				<SwitchSwapDirection />
				<AmountOut />
			</section>
			<ReviewSwapDialog />
		</Container>
	);
}

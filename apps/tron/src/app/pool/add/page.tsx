"use client";
import { ArrowLeftIcon } from "@heroicons/react/20/solid";
import { Container, IconButton, SettingsModule, SettingsOverlay } from "@sushiswap/ui";
import Link from "next/link";
import { Title } from "src/components/General/Title";
import { AmountInToken0 } from "src/components/Pools/Add/AmountInToken0";
import { AmountInToken1 } from "src/components/Pools/Add/AmountIntToken1";
import { Plus } from "src/components/Pools/Add/Plus";
import { ReviewAddDialog } from "src/components/Pools/Add/ReviewAddDialog";

export default function AddPage() {
	return (
		<Container className="p-4 mx-auto mt-16 mb-[86px] flex flex-col gap-4 max-w-[520px]">
			<Link href="/pool">
				<IconButton icon={ArrowLeftIcon} name="Go back to pools" description="Go back to pools" />
			</Link>
			<section className="flex items-center justify-between">
				<Title>Add Liquidity</Title>
				<SettingsOverlay
					options={{ slippageTolerance: { storageKey: "sushi-tron-slippage" } }} //use this key to get slippage from localStorage
					modules={[SettingsModule.SlippageTolerance]}
				/>
			</section>
			<section className="flex flex-col gap-4 relative">
				<AmountInToken0 />
				<Plus />
				<AmountInToken1 />
			</section>
			<ReviewAddDialog />
		</Container>
	);
}

"use client";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import { Container } from "@sushiswap/ui/components/Container";
import { Button } from "@sushiswap/ui/components/button";
import { DiscordIcon } from "@sushiswap/ui/components/icons";
import Link from "next/link";
import { PoolsView } from "src/components/Pools/PoolsView";

export default function Pool() {
	return (
		<>
			<Container maxWidth="7xl" className="mx-auto px-4 pt-[80px] lg:pb-[54px]">
				<div className="flex flex-col justify-between gap-12 lg:flex-row lg:items-center">
					<div className="flex flex-col items-center flex-grow gap-6 lg:items-start">
						<div className="flex flex-col">
							<h1 className="scroll-m-20 text-3xl font-bold tracking-tighter md:text-5xl lg:leading-[1.1]">
								Put your funds to work <br />
								by providing liquidity.
							</h1>
							<p className="scroll-m-20 leading-7 [&:not(:first-child)]:mt-6 text-lg text-gray-600 dark:text-slate-400 sm:text-xl max-w-[500px]">
								When you add liquidity to a pool, you can receive a share of its trading volume and
								potentially snag extra rewards when there are incentives involved!
							</p>
						</div>
						<div className="flex items-center">
							<Link href="/pool/add">
								<Button size="lg">Create Position</Button>
							</Link>
						</div>
					</div>
					<div className="relative z-10 group">
						<div className="flex flex-col items-center gap-4 lg:items-end">
							<div className="flex flex-col items-center gap-1 lg:items-end">
								<span className="font-semibold lg:text-sm">Looking for a partnership with Sushi?</span>
								<Link
									href="https://rbieu62gj0f.typeform.com/to/KkrPkOFe"
									className="font-medium text-blue hover:!text-blue-600 lg:text-sm flex gap-1 items-center">
									Join Onsen <ChevronRightIcon width={16} height={16} />
								</Link>
							</div>
							<div className="flex flex-col items-center gap-1 lg:items-end">
								<span className="font-semibold lg:text-sm">Need Help?</span>
								<Link
									href="https://discord.gg/NVPXN4e"
									className="font-medium text-blue hover:!text-blue-600 lg:text-sm flex gap-1 items-center">
									<DiscordIcon width={16} height={16} /> Join our discord
								</Link>
							</div>
						</div>
					</div>
				</div>
			</Container>
			<PoolsView />
		</>
	);
}

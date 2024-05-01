import { Button, Container } from "@sushiswap/ui";
import Link from "next/link";
import { PoolHeader } from "src/components/Pools/PoolDetails/PoolHeader";
import { PoolLiquidity } from "src/components/Pools/PoolDetails/PoolLiquidity";
import { PoolPosition } from "src/components/Pools/PoolPosition/PoolPosition";

export default function PoolByIdPage({ params }: { params: { poolId: string } }) {
	const { poolId } = params;
	const decodedPoolId = decodeURIComponent(poolId);
	const token0 = decodedPoolId?.split(":")?.[0];
	const token1 = decodedPoolId?.split(":")?.[1];

	return (
		<Container className="p-4 mx-auto mt-8 pb-[86px] justify-between flex flex-col lg:flex-row gap-12 max-w-5xl">
			<section className="w-full flex flex-col gap-4">
				<PoolHeader />
				<hr className="border-gray-900/5 border-t dark:border-slate-200/20 my-3" />
				<PoolLiquidity />
			</section>
			<section className="w-full lg:w-[60%] flex flex-col gap-4">
				<PoolPosition />
				<div className="flex flex-col gap-2">
					<div className="flex gap-2">
						<Link href={`/pool/${poolId}/remove`} className="w-full">
							<Button size="lg" variant="secondary" className="w-full">
								Withdraw
							</Button>
						</Link>
						<Link href={`/pool/add?token0=${token0}&token1=${token1}`} className="w-full">
							<Button variant="default" size="lg" className="w-full">
								Deposit
							</Button>
						</Link>
					</div>
					<Link href={`/swap?token0=${token0}&token1=${token1}`} className="w-full">
						<Button size="lg" className="w-full" variant="secondary">
							Trade
						</Button>
					</Link>
				</div>
			</section>
		</Container>
	);
}

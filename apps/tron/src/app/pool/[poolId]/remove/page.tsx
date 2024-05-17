"use client";
import { Container } from "@sushiswap/ui";
// import { LiquidityPosition } from "src/components/Pools/PoolPosition/LiquidityPosition";
import { PoolPosition } from "src/components/Pools/PoolPosition/PoolPosition";
import { RemoveLiquidity } from "src/components/Pools/Remove/RemoveLiquidity";
import { useTokenInfo } from "src/hooks/useTokenInfo";
import { useRemoveLiqDispatch } from "./remove-provider";
import { useEffect } from "react";

export default function RemoveLiqPage({ params }: { params: { poolId: string } }) {
	const { poolId } = params;
	const decodedPoolId = decodeURIComponent(poolId);
	const token0 = decodedPoolId?.split(":")?.[0];
	const token1 = decodedPoolId?.split(":")?.[1];
	const pairAddress = decodedPoolId?.split(":")?.[2];
	const { data: token0Data, isLoading: isLoadingToken0 } = useTokenInfo({ tokenAddress: token0 });
	const { data: token1Data, isLoading: isLoadingToken1 } = useTokenInfo({ tokenAddress: token1 });
	const isLoadingTokens = isLoadingToken0 || isLoadingToken1;
	const { setToken0, setToken1 } = useRemoveLiqDispatch();

	useEffect(() => {
		if (token0Data) {
			setToken0(token0Data);
		}
		if (token1Data) {
			setToken1(token1Data);
		}
	}, [token0Data, token1Data]);

	return (
		<Container className="p-4 mx-auto mt-8 mb-[86px] justify-between flex flex-col lg:flex-row gap-6 max-w-5xl">
			<section className="w-full">
				<RemoveLiquidity />
			</section>
			<section className="w-full lg:w-[60%]">
				<PoolPosition token0={token0Data} token1={token1Data} isLoading={isLoadingTokens} />
				{/* <div className="flex flex-col bg-white dark:bg-opacity-[0.04] rounded-2xl p-5">
					<LiquidityPosition isLoading={false} />
				</div> */}
			</section>
		</Container>
	);
}

import { formatUSD, formatNumber } from "sushi/format";
import { List } from "@sushiswap/ui/components/list/List";
import { Icon } from "src/components/General/Icon";

export const PoolLiquidity = () => {
	const token0 = { symbol: "TRX" };
	const token1 = { symbol: "USDC" };
	const token0PoolPrice = 5;
	const token1PoolPrice = 10;
	const balanceOfToken0 = 41.666666666667;
	const balanceOfToken1 = 10;

	return (
		<List>
			<div className="flex items-center justify-between">
				<List.Label>Pool Liquidity</List.Label>
				<List.Label>{formatUSD(token0PoolPrice + token1PoolPrice)}</List.Label>
			</div>
			<List.Control>
				<List.KeyValue flex title={`${token0.symbol}`}>
					<div className="flex flex-col gap-2">
						<div className="flex items-center gap-2">
							<Icon currency={token0} width={18} height={18} />
							{formatNumber(balanceOfToken0)} {" " + token0.symbol}
							<span className="text-gray-600 dark:text-slate-400">({formatUSD(token0PoolPrice)})</span>
						</div>
					</div>
				</List.KeyValue>

				<List.KeyValue flex title={`${token1.symbol}`}>
					<div className="flex flex-col gap-2">
						<div className="flex items-center gap-2">
							<Icon currency={token1} width={18} height={18} />
							{formatNumber(balanceOfToken1)} {" " + token1.symbol}
							<span className="text-gray-600 dark:text-slate-400">({formatUSD(token1PoolPrice)})</span>
						</div>
					</div>
				</List.KeyValue>
			</List.Control>
		</List>
	);
};

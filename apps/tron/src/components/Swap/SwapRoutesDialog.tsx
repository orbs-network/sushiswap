import { Button } from "@sushiswap/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@sushiswap/ui";
import { Icon } from "../General/Icon";

export const SwapRoutesDialog = () => {
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant="link">View</Button>
			</DialogTrigger>

			<DialogContent>
				<DialogHeader>
					<DialogTitle>Trade Route</DialogTitle>
					<DialogDescription>Optimized route to get the best price</DialogDescription>
				</DialogHeader>
				<div className="flex flex-col gap-2 min-h-[100px] items-center justify-center w-full">
					<SwapRoute token0Address={"token0"} token1Address={"token1"} />
				</div>
			</DialogContent>
		</Dialog>
	);
};

const SwapRoute = ({ token0Address, token1Address }: { token0Address: string; token1Address: string }) => {
	return (
		<div className="flex items-center w-full gap-2 justify-between border-2 dark:border-slate-400 rounded-full px-2 py-1">
			<div className="flex items-center gap-2">
				<Icon width={16} height={16} currency={"token0"} />
				<span className="text-sm font-medium">token0</span>
			</div>
			<div className="flex items-center gap-2">
				<Icon width={16} height={16} currency={"token1"} />
				<span className="text-sm font-medium">token1</span>
			</div>
		</div>
	);
};

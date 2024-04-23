import { TextField } from "@sushiswap/ui";
import { TokenListSelect } from "../General/TokenListSelect";
import { DollarAmountDisplay } from "./DollarAmountDisplay";
import { TokenBalanceDisplay } from "./TokenBalanceDisplay";

type SwapInputProps = {
	type: "input" | "output";
};

export const SwapInput = ({ type }: SwapInputProps) => {
	return (
		<div className="flex flex-col gap-2 bg-white px-3 py-4 dark:bg-slate-800 rounded-xl">
			<div className="flex items-center gap-2">
				<TextField
					className="text-xl font-bold bg-transparent !px-0 hover:!bg-transparent"
					disabled={type === "output"}
					id={`swap-${type}`}
					placeholder="0"
					type="number"
				/>
				<TokenListSelect />
			</div>
			<div className="flex justify-between gap-2 items-center">
				<DollarAmountDisplay isLoading={false} error={undefined} value={"0.00"} />
				<TokenBalanceDisplay
					amount={0}
					isLoading={false}
					type={type}
					decimals={18}
					maxAmount={() => {
						if (type === "output") return;
						console.log("maxAmount");
					}}
				/>
			</div>
		</div>
	);
};

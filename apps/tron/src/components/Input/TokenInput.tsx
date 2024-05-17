import { TextField } from "@sushiswap/ui";
import { TokenListSelect } from "../General/TokenListSelect";
import { DollarAmountDisplay } from "../Shared/DollarAmountDisplay";
import { TokenBalanceDisplay } from "../Shared/TokenBalanceDisplay";
import { IToken } from "src/types/token-type";
import { useTokenBalance } from "src/hooks/useTokenBalance";
import { useWallet } from "@tronweb3/tronwallet-adapter-react-hooks";
import { formatUnitsForInput } from "src/utils/formatters";

type TokenInputProps = {
	type: "input" | "output";
	token: IToken | undefined;
	setToken: (token: IToken) => void;
	amount: string;
	setAmount: (amount: string) => void;
};

export const TokenInput = ({ type, token, setToken, amount, setAmount }: TokenInputProps) => {
	const { address } = useWallet();
	const { data: tokenBalance, isInitialLoading: isInitialLoadingTokenBalance } = useTokenBalance({
		accountAddress: address,
		tokenAddress: token?.address,
	});

	return (
		<div className="flex flex-col gap-2 bg-white px-3 py-4 dark:bg-slate-800 rounded-xl">
			<div className="flex items-center gap-2">
				<TextField
					className="text-xl font-bold bg-transparent !px-0 hover:!bg-transparent"
					disabled={type === "output"}
					id={`swap-${type}`}
					placeholder="0"
					type="number"
					value={amount}
					onChange={(e) => {
						if (type === "output") return;
						const value = e.target.value;
						setAmount(value);
					}}
					// isError={true}
				/>
				<TokenListSelect setToken={setToken} token={token} />
			</div>
			<div className="flex justify-between gap-2 items-center">
				<DollarAmountDisplay isLoading={false} error={undefined} value={"0.00"} />
				<TokenBalanceDisplay
					amount={Number(tokenBalance ?? 0)}
					isLoading={isInitialLoadingTokenBalance}
					type={type}
					decimals={token?.decimals ?? 0}
					maxAmount={() => {
						if (type === "output") return;
						if (tokenBalance === "0") {
							setAmount("");
							return;
						}
						setAmount(formatUnitsForInput(tokenBalance ?? "0", token?.decimals ?? 0));
					}}
				/>
			</div>
		</div>
	);
};

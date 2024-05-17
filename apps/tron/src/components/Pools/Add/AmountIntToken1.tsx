import { usePoolDispatch, usePoolState } from "src/app/pool/pool-provider";
import { TokenInput } from "src/components/Input/TokenInput";

export const AmountInToken1 = () => {
	const { token1, amountInToken1 } = usePoolState();
	const { setToken1, setAmountInToken1 } = usePoolDispatch();
	return (
		<TokenInput
			type="input"
			amount={amountInToken1}
			setAmount={setAmountInToken1}
			token={token1}
			setToken={setToken1}
		/>
	);
};

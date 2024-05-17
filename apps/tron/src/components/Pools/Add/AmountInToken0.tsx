import { usePoolDispatch, usePoolState } from "src/app/pool/pool-provider";
import { TokenInput } from "src/components/Input/TokenInput";

export const AmountInToken0 = () => {
	const { token0, amountInToken0 } = usePoolState();
	const { setToken0, setAmountInToken0 } = usePoolDispatch();
	return (
		<TokenInput
			type="input"
			amount={amountInToken0}
			setAmount={setAmountInToken0}
			token={token0}
			setToken={setToken0}
		/>
	);
};

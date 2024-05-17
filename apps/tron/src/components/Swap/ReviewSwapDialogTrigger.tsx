import { Button, Checkbox, DialogTrigger } from "@sushiswap/ui";
import { useWallet } from "@tronweb3/tronwallet-adapter-react-hooks";
import { useEffect, useMemo, useState } from "react";
import { useSwapDispatch, useSwapState } from "src/app/swap/swap-provider";
import { ROUTER_CONTRACT } from "src/constants/contracts";
import { useAllowance } from "src/hooks/useAllowance";
import { useTokenBalance } from "src/hooks/useTokenBalance";
import { formatUnitsForInput } from "src/utils/formatters";
import { ApproveToken } from "../Shared/ApproveToken";
import { usePairContract } from "src/hooks/usePairContract";
import { useReserves } from "src/hooks/useReserves";
import { usePriceImpact } from "src/hooks/usePriceImpact";
import { warningSeverity } from "src/utils/warning-severity";

export const ReviewSwapDialogTrigger = () => {
	const [isChecked, setIsChecked] = useState<boolean>(false);
	const { token0, token1, amountIn, amountOut } = useSwapState();
	const { setPriceImpactPercentage } = useSwapDispatch();
	const { address } = useWallet();
	const { data: allowanceAmount, refetch } = useAllowance({
		tokenAddress: token0?.address as string,
		ownerAddress: address as string,
		spenderAddress: ROUTER_CONTRACT,
	});
	const { data: tokenBalance, isLoading } = useTokenBalance({
		accountAddress: address,
		tokenAddress: token0.address,
	});
	const { data: pairContract, isLoading: isPairLoading } = usePairContract({
		token0Address: token0?.address,
		token1Address: token1?.address,
	});
	const { data: reserves, isLoading: isReservesLoading } = useReserves({
		pairAddress: pairContract,
		token0,
		token1,
	});
	const { data: priceImpactPercentage } = usePriceImpact({
		amountIn,
		token0,
		reserves,
	});

	useEffect(() => {
		setPriceImpactPercentage(priceImpactPercentage ?? 0);
	}, [priceImpactPercentage]);

	const refreshAllowance = async () => {
		await refetch();
	};

	const hasInsufficientBalance = useMemo(() => {
		if (isLoading) return true;
		return Number(formatUnitsForInput(tokenBalance ?? "0", token0.decimals)) < Number(amountIn);
	}, [tokenBalance, token0, amountIn, isLoading]);

	const pairDoesNotExist = Boolean(amountIn && !amountOut) && !pairContract && !isPairLoading;

	const buttonText = useMemo(() => {
		if (!amountIn || amountIn === "0") {
			return "Enter Amount";
		}
		if (pairDoesNotExist) {
			return "Pair Does Not Exist";
		}
		if (hasInsufficientBalance) {
			return "Insufficient Balance";
		}
		if (token0?.symbol === "WTRX" && token1?.address === "TRON") {
			return "Unwrap";
		}
		if (token0?.address === "TRON" && token1?.symbol === "WTRX") {
			return "Wrap";
		}
		if (allowanceAmount && Number(amountIn) > Number(allowanceAmount) && token0?.address !== "TRON") {
			return "Approve";
		}
		return "Review Swap";
	}, [amountIn, allowanceAmount, token0, token1, hasInsufficientBalance, pairDoesNotExist]);

	const userConfirmationNeeded = useMemo(() => {
		if (
			warningSeverity(priceImpactPercentage ?? 0) > 3 &&
			(buttonText === "Review Swap" || buttonText === "Approve")
		) {
			return true;
		}
		return false;
	}, [priceImpactPercentage, buttonText]);

	return (
		<>
			{buttonText === "Approve" ? (
				<ApproveToken
					tokenToApprove={token0}
					amount={amountIn}
					spenderAddress={ROUTER_CONTRACT}
					onSuccess={refreshAllowance}
				/>
			) : (
				<DialogTrigger
					disabled={
						(userConfirmationNeeded && !isChecked) || !amountIn || hasInsufficientBalance || pairDoesNotExist
					}
					asChild>
					<Button size="lg">{buttonText}</Button>
				</DialogTrigger>
			)}
			{userConfirmationNeeded && !isChecked ? (
				<div
					onClick={() => setIsChecked(!isChecked)}
					className="flex items-start px-4 py-3 mt-4 rounded-xl bg-red/20 dark:bg-red/40 cursor-pointer">
					<Checkbox color="red" id="expert-checkbox" checked={isChecked} />
					<label htmlFor="expert-checkbox" className="ml-2 font-medium text-red-600 dark:text-red-300">
						Price impact is too high. You will lose a big portion of your funds in this trade. Please tick the
						box if you would like to continue.
					</label>
				</div>
			) : null}
		</>
	);
};

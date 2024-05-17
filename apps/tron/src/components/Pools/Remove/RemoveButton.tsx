// import { useSlippageTolerance } from "@sushiswap/hooks";
import { Button, Dots, createFailedToast, createInfoToast, createSuccessToast } from "@sushiswap/ui";
import { useWallet } from "@tronweb3/tronwallet-adapter-react-hooks";
import { useRemoveLiqDispatch, useRemoveLiqState } from "src/app/pool/[poolId]/remove/remove-provider";
import { WalletConnector } from "src/components/WalletConnector/WalletConnector";
import { getTronscanTxnLink } from "src/utils/tronscan-helpers";

export const RemoveButton = () => {
	const { address, connected } = useWallet();
	const isConnected = address && connected;
	const { percentage, isTxnPending } = useRemoveLiqState();
	const { setIsTxnPending, setPercentage } = useRemoveLiqDispatch();
	// const [slippageTolerance] = useSlippageTolerance("sushi-tron-slippage-remove");

	const removeLiquidity = async () => {
		const txnHash = "5842e34e8d90890b9c39054f3012824cdc51d7b42155dbafc867fbc67fd80462";
		try {
			setIsTxnPending(true);
			createInfoToast({
				summary: "Removing liquidity from the USDC/TRX pair.", //get pair from state
				type: "swap",
				account: address as string,
				chainId: 1,
				groupTimestamp: Date.now(),
				timestamp: Date.now(),
				txHash: txnHash,
				href: getTronscanTxnLink(txnHash),
			});
			//wait for 5 seconds to sim txn
			await new Promise((resolve) => setTimeout(resolve, 5000));
			//create success toast
			createSuccessToast({
				summary: "Successfully removed liquidity!",
				txHash: txnHash,
				type: "swap",
				account: address as string,
				chainId: 1,
				groupTimestamp: Date.now(),
				timestamp: Date.now(),
				href: getTronscanTxnLink(txnHash),
			});
			setPercentage(0);
			setIsTxnPending(false);
		} catch (error) {
			//create error toast
			createFailedToast({
				summary: "Something went wrong while removing liquidity.",
				type: "swap",
				account: address as string,
				chainId: 1,
				groupTimestamp: Date.now(),
				timestamp: Date.now(),
				href: getTronscanTxnLink(txnHash),
			});
			console.log(error);
			setPercentage(0);
			setIsTxnPending(false);
		}
	};

	return (
		<>
			{!isConnected ? (
				<WalletConnector variant="default" hideChevron={true} fullWidth={true} size="lg" />
			) : (
				<Button
					onClick={removeLiquidity}
					size="lg"
					variant="default"
					className="w-full"
					disabled={percentage === 0 || isTxnPending}>
					{isTxnPending ? (
						<Dots>Confirming Removal</Dots>
					) : percentage === 0 ? (
						"Enter Amount"
					) : isTxnPending ? (
						"Pending"
					) : (
						"Remove"
					)}
				</Button>
			)}
		</>
	);
};

import { PlusIcon } from "@heroicons/react/24/outline";
import { useSlippageTolerance } from "@sushiswap/hooks";
import { Badge } from "@sushiswap/ui/components/Badge";
import { Dots } from "@sushiswap/ui/components/Dots";
import { Button } from "@sushiswap/ui/components/button";
import { List } from "@sushiswap/ui/components/list/List";
import { SkeletonText, SkeletonBox, SkeletonCircle } from "@sushiswap/ui/components/skeleton";
import { Icon } from "../../General/Icon";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	classNames,
	createInfoToast,
} from "@sushiswap/ui";
import { useWallet } from "@tronweb3/tronwallet-adapter-react-hooks";
import { warningSeverity, warningSeverityClassName } from "src/utils/warning-severity";
import Link from "next/link";
import { truncateText } from "src/utils/formatters";
import { getTronscanAddressLink, getTronscanTxnLink } from "src/utils/tronscan-helpers";
import { useRef } from "react";
import { createFailedToast, createSuccessToast } from "@sushiswap/ui";
import { WalletConnector } from "../../WalletConnector/WalletConnector";
import { usePoolDispatch, usePoolState } from "src/app/pool/pool-provider";
import { Rate } from "./Rate";

export const ReviewAddDialog = () => {
	const { token0, token1, isTxnPending } = usePoolState();
	const { setIsTxnPending } = usePoolDispatch();
	const closeBtnRef = useRef<HTMLButtonElement>(null);
	const { address, connected } = useWallet();
	const isConnected = address && connected;

	const closeModal = () => {
		closeBtnRef?.current?.click();
	};

	//maybe break out to new component
	const addLiquidity = async () => {
		try {
			setIsTxnPending(true);
			const txnHash = "5842e34e8d90890b9c39054f3012824cdc51d7b42155dbafc867fbc67fd80462";
			createInfoToast({
				summary: "Add liquidity initiated...",
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
				summary: "Add liquidity successful, and other details",
				txHash: txnHash,
				type: "swap",
				account: address as string,
				chainId: 1,
				groupTimestamp: Date.now(),
				timestamp: Date.now(),
				href: getTronscanTxnLink(txnHash),
			});
			setIsTxnPending(false);
			closeModal();
		} catch (error) {
			//create error toast
			createFailedToast({
				summary: "Add liquidity failed, and other details",
				type: "swap",
				account: address as string,
				chainId: 1,
				groupTimestamp: Date.now(),
				timestamp: Date.now(),
			});
			console.log(error);
			setIsTxnPending(false);
		}
	};
	const [slippageTolerance] = useSlippageTolerance("sushi-tron-slippage");

	return (
		<Dialog>
			{isConnected ? (
				<DialogTrigger>
					<Button size="lg" className="w-full">
						Enter Amount
					</Button>
				</DialogTrigger>
			) : (
				<WalletConnector variant="default" hideChevron={true} fullWidth={true} size="lg" />
			)}
			<DialogContent>
				<DialogClose ref={closeBtnRef} />
				<DialogHeader>
					<DialogTitle>Add liquidity</DialogTitle>
					<DialogDescription>Please review your entered details.</DialogDescription>
				</DialogHeader>
				<div className="max-w-[504px] mx-auto w-full">
					<div className="flex flex-col gap-4 w-full">
						<List className="w-full">
							<List.Control>
								<List.KeyValue title="TRX">
									<div className="flex flex-col items-end">
										<div className="flex items-center">
											<Icon currency={"token0"} width={16} height={16} />
											<div className="ml-2">23.212</div>
											<div>TRX</div>
										</div>
										<div className="text-[12px] opacity-60">$3.00</div>
									</div>
								</List.KeyValue>
								<List.KeyValue title="USDC">
									<div className="flex flex-col items-end">
										<div className="flex items-center">
											<Icon currency={"token0"} width={16} height={16} />
											<div className="ml-2">3</div>
											<div>USDC</div>
										</div>
										<div className="text-[12px] opacity-60">$3.00</div>
									</div>
								</List.KeyValue>
								<List.KeyValue title="Rate">
									<Rate />
								</List.KeyValue>
							</List.Control>
						</List>
						<Button disabled={isTxnPending} color="blue" fullWidth size="xl" onClick={addLiquidity}>
							{isTxnPending ? <Dots>Adding Liquidity</Dots> : <>Add</>}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};

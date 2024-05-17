import { getTronscanTxnLink } from "src/utils/tronscan-helpers";
import {
	Button,
	Command,
	CommandGroup,
	CommandItem,
	Dots,
	Popover,
	PopoverContent,
	PopoverTrigger,
	createFailedToast,
	createInfoToast,
	createSuccessToast,
} from "@sushiswap/ui";
import { useState } from "react";
import { IToken } from "src/types/token-type";
import { useWallet } from "@tronweb3/tronwallet-adapter-react-hooks";

export const ApproveToken = ({
	tokenToApprove,
	amount,
	spenderAddress,
	onSuccess,
}: {
	tokenToApprove: IToken;
	amount: string;
	spenderAddress: string;
	onSuccess: () => Promise<void>;
}) => {
	const [isApproving, setIsApproving] = useState<boolean>(false);
	const { address } = useWallet();

	const approveToken = async (type: "one-time" | "unlimited") => {
		try {
			setIsApproving(true);
			const txnHash = "5842e34e8d90890b9c39054f3012824cdc51d7b42155dbafc867fbc67fd80462";
			//if type is unlimited to do max uint256, else amount
			//approve  - spenderAddress
			createInfoToast({
				summary: type === "one-time" ? "Approving One Time..." : "Approval Unlimited Amonut...",
				type: "approval",
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
				summary: "Approval successful",
				txHash: txnHash,
				type: "swap",
				account: address as string,
				chainId: 1,
				groupTimestamp: Date.now(),
				timestamp: Date.now(),
				href: getTronscanTxnLink(txnHash),
			});
			await onSuccess();
			setIsApproving(false);
		} catch (error) {
			//create error toast
			createFailedToast({
				summary: "Approval failed",
				type: "swap",
				account: address as string,
				chainId: 1,
				groupTimestamp: Date.now(),
				timestamp: Date.now(),
			});
			console.log(error);
			setIsApproving(false);
		}
	};

	return (
		<Popover>
			<PopoverTrigger disabled={isApproving}>
				<Button
					asChild
					disabled={isApproving}
					loading={isApproving}
					role="combobox"
					size="lg"
					className="w-full">
					{isApproving ? <Dots>Approving</Dots> : "Approve"}
				</Button>
				<PopoverContent className="!p-0 !overflow-x-hidden !overflow-y-scroll scroll">
					<Command>
						<CommandGroup>
							<CommandItem className="cursor-pointer">
								<div
									onClick={async () => {
										await approveToken("one-time");
									}}
									className="flex flex-col">
									<p className="font-bold">Approve one-time only</p>
									<p>
										You&apos;ll give your approval to spend {amount} {tokenToApprove.symbol} on your behalf
									</p>
								</div>
							</CommandItem>
							<CommandItem className="cursor-pointer">
								<div
									onClick={async () => {
										await approveToken("unlimited");
									}}
									className="flex flex-col">
									<p className="font-bold">Approve unlimited amount</p>
									<p>
										You won&apos;t need to approve again next time you want to spend {tokenToApprove.symbol}.
									</p>
								</div>
							</CommandItem>
						</CommandGroup>
					</Command>
				</PopoverContent>
			</PopoverTrigger>
		</Popover>
	);
};

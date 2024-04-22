import { Cog6ToothIcon, DocumentDuplicateIcon, LinkIcon } from "@heroicons/react/24/outline";
import { ArrowLeftOnRectangleIcon } from "@heroicons/react/24/outline";
import { IconButton, JazzIcon } from "@sushiswap/ui";
import React, { Dispatch, SetStateAction } from "react";
import { IProfileView } from "./WalletConnector";
import { SkeletonText } from "@sushiswap/ui/components/skeleton";
import { formatUSD, formatNumber } from "sushi/format";
import { useWallet } from "@tronweb3/tronwallet-adapter-react-hooks";
import { truncateText } from "src/utils/formatters";
import { useNativeBalance } from "src/hooks/useNativeBalance";
import { IS_TESTNET } from "src/constants/is-testnet";
import Link from "next/link";
import { useClipboard } from "src/hooks/useClipboard";

type DefaultViewProps = {
	setView: Dispatch<SetStateAction<IProfileView>>;
};

export const DefaultView = ({ setView }: DefaultViewProps) => {
	const { address, disconnect } = useWallet();
	const { data, isLoading } = useNativeBalance();
	const { isCopied, handleCopy } = useClipboard();

	//TODO get price of TRX from somewhere
	const price = 0.112;

	return (
		<div className="flex flex-col gap-8 p-4 w-full">
			<div className="flex justify-between gap-2 w-full">
				<div className="text-sm font-semibold flex items-center gap-1.5 text-gray-700 dark:text-slate-200">
					{address && <JazzIcon diameter={16} address={address} />}
					<span className="cursor-pointer" onClick={() => handleCopy(address ?? "")}>
						{truncateText(address ?? "")}
					</span>
				</div>
				<div className="flex items-center gap-1">
					<IconButton
						icon={Cog6ToothIcon}
						onClick={() => setView("settings")}
						name="Settings"
						description="Settings"
						size="xs"
					/>
					<IconButton
						icon={DocumentDuplicateIcon}
						onClick={() => handleCopy(address ?? "")}
						name={isCopied ? "Copied" : "Copy Address"}
						description={isCopied ? "Copied" : "Copy Address"}
						size="xs"
					/>
					<Link
						href={`https://${IS_TESTNET ? "shasta." : ""}tronscan.org/#/address/${address}`}
						target="_blank"
						rel="noopenner noreferrer">
						<IconButton icon={LinkIcon} size="xs" name="View on Explorer" description="View on Explorer" />
					</Link>
					<IconButton
						icon={ArrowLeftOnRectangleIcon}
						onClick={async () => await disconnect()}
						name="Disconnect"
						size="xs"
						description="Disconnect"
					/>
				</div>
			</div>
			<div className="flex flex-col gap-2 justify-center items-center">
				<p className="text-3xl font-medium whitespace-nowrap">{formatNumber(data?.formattedBalance)} TRX</p>
				{isLoading || !price || data?.formattedBalance === undefined ? (
					<div className="w-12">
						<SkeletonText fontSize="text-base" />
					</div>
				) : (
					<p className="font-medium text-slate-400">{formatUSD(price * data?.formattedBalance)}</p>
				)}
			</div>
		</div>
	);
};

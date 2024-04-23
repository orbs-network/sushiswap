import {
	Button,
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	List,
	SelectIcon,
} from "@sushiswap/ui";
import { Search } from "../Input/Search";
import { useState } from "react";
import { Icon } from "./Icon";

export const TokenListSelect = () => {
	const [query, setQuery] = useState<string>("");

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button
					icon={() => <Icon currency="token" width={22} height={22} />}
					size="sm"
					variant="secondary"
					className="!rounded-full flex items-center !px-2 !py-1">
					<span>TRX</span>
					<SelectIcon />
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Tokens</DialogTitle>
				</DialogHeader>
				<div className="mt-4">
					<Search id={"token-search"} value={query} loading={false} onChange={setQuery} />
				</div>

				<div className="flex flex-col gap-4">
					<List className="!pt-0">
						<List.Control>
							<List.KeyValue title="Token 0">token</List.KeyValue>
							<List.KeyValue title="Token 1">token</List.KeyValue>
						</List.Control>
					</List>
				</div>
			</DialogContent>
		</Dialog>
	);
};

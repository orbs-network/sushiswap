import { FC, useCallback } from "react";
import { Search } from "../Input/Search";
import { ChipInput } from "@sushiswap/ui";
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";

type PoolSearchBarProps = {
	query: string;
	setQuery: React.Dispatch<React.SetStateAction<string>>;
	placeholder: string;
};

export const PoolSearchBar: FC<PoolSearchBarProps> = ({ setQuery, query, placeholder }) => {
	const onValueChange = useCallback(
		(values: string[]) => {
			setQuery(values.join(" "));
		},
		[setQuery]
	);
	return (
		// <Search placeholder={placeholder} id="search" loading={false} onChange={setQuery} value={query ?? ""} />
		<div className="w-fit">
			<ChipInput
				size="sm"
				icon={MagnifyingGlassIcon}
				delimiters={[",", " ", ";", ":", "Enter"]}
				variant="outline"
				values={query.split(" ")}
				onValueChange={onValueChange}
				placeholder={placeholder}
				maxValues={1}
			/>
		</div>
	);
};

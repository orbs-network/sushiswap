import { FC } from "react";
import { Search } from "../Input/Search";

type PoolSearchBarProps = {
	query: string;
	setQuery: React.Dispatch<React.SetStateAction<string>>;
	placeholder: string;
};

export const PoolSearchBar: FC<PoolSearchBarProps> = ({ setQuery, query, placeholder }) => {
	return (
		<Search placeholder={placeholder} id="search" loading={false} onChange={setQuery} value={query ?? ""} />
	);
};

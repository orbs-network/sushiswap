import { FC } from "react";
import { Search } from "../Input/Search";

type PoolSearchBarProps = {
	query: string;
	setQuery: React.Dispatch<React.SetStateAction<string>>;
};

export const PoolSearchBar: FC<PoolSearchBarProps> = ({ setQuery, query }) => {
	return <Search id="search" loading={false} onChange={setQuery} value={query ?? ""} delimiter=" " />;
};

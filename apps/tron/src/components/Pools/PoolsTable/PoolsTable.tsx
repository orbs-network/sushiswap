import { DataTable } from "@sushiswap/ui";
import { TVL_COLUMN, NAME_COLUMN, RESERVES_COLUMN } from "./PoolColumns";
import { usePools } from "src/hooks/usePools";
import { PaginationState } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { useDebounce } from "@sushiswap/hooks";

export type IRowData = {
	name: string;
	pairAddress: string;
	token0Address: string;
	token1Address: string;
	reserve0: string;
	reserve1: string;
	tvl: string;
};

type PoolsTableProps = {
	query: string;
};

export const PoolsTable = ({ query }: PoolsTableProps) => {
	const [paginationState, setPaginationState] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 10,
	});
	const debouncedQuery = useDebounce(query, 250);
	const { data, isLoading } = usePools();

	const filteredData = useMemo(() => {
		if (!data) return [];
		if (!debouncedQuery) return data;
		return data.filter((pool) => {
			return (
				pool.pairAddress.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
				pool.token0Address.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
				pool.token1Address.toLowerCase().includes(debouncedQuery.toLowerCase())
			);
		});
	}, [data, debouncedQuery]);

	return (
		<DataTable
			loading={isLoading}
			data={
				filteredData?.map((pool) => ({
					name: pool.token0Address + "/" + pool.token1Address,
					pairAddress: pool.pairAddress,
					token0Address: pool.token0Address,
					token1Address: pool.token1Address,
					reserve0: pool.reserve0,
					reserve1: pool.reserve1,
					tvl: "0",
				})) ?? []
			}
			columns={[NAME_COLUMN, TVL_COLUMN, RESERVES_COLUMN]}
			linkFormatter={(data) => {
				const token0 = data.name.split("/")[0];
				const token1 = data.name.split("/")[1];
				return `/pool/${token0}:${token1}:${data.pairAddress}`;
			}}
			pagination={true}
			externalLink={false}
			onPaginationChange={setPaginationState}
			state={{
				pagination: paginationState,
			}}
		/>
	);
};

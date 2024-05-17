import { DataTable } from "@sushiswap/ui";
import { TVL_COLUMN } from "../PoolsTable/PoolColumns";
import { POSITION_NAME_COLUMN, SIZE_COLUMN } from "./PositionColumns";
import { useMyPositions } from "src/hooks/useMyPositions";
import { useMemo, useState } from "react";
import { PaginationState } from "@tanstack/react-table";
import { useDebounce } from "@sushiswap/hooks";
import { IMyPositionData } from "src/types/get-pools-type";

type PositionsTableProps = {
	query: string;
};

export const PositionsTable = ({ query }: PositionsTableProps) => {
	const [paginationState, setPaginationState] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 10,
	});
	const debouncedQuery = useDebounce(query, 250);
	const { data, isLoading } = useMyPositions();

	const filteredData = useMemo(() => {
		if (!data) return [];
		if (!debouncedQuery) return data;
		return data?.filter((pool) => {
			return (
				pool?.pairAddress.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
				pool?.token0?.address?.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
				pool?.token1?.address?.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
				pool?.token0?.symbol?.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
				pool?.token1?.symbol?.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
				pool?.token0?.name?.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
				pool?.token1?.name?.toLowerCase().includes(debouncedQuery.toLowerCase())
			);
		});
	}, [data, debouncedQuery]);
	return (
		<DataTable
			loading={isLoading}
			data={
				filteredData?.map((pool) => ({
					token0: pool?.token0,
					token1: pool?.token1,
					pairAddress: pool?.pairAddress,
				})) ?? []
			}
			columns={[POSITION_NAME_COLUMN, TVL_COLUMN, SIZE_COLUMN]}
			linkFormatter={(data: IMyPositionData) => {
				const token0 = data?.token0?.address;
				const token1 = data?.token1?.address;
				return `/pool/${token0}:${token1}:${data?.pairAddress}`;
			}}
			externalLink={false}
			pagination={true}
			state={{
				pagination: paginationState,
			}}
			onPaginationChange={setPaginationState}
		/>
	);
};

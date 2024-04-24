import { DataTable } from "@sushiswap/ui";
import { APR_COLUMN, NAME_COLUMN, TVL_COLUMN } from "../PoolsTable/PoolColumns";
import { SIZE_COLUMN } from "./PositionColumns";

type PositionsTableProps = {
	query: string;
};

export const PositionsTable = ({ query }: PositionsTableProps) => {
	return (
		<DataTable
			loading={false}
			data={[{ name: "hello", apr: "0" }]}
			columns={[NAME_COLUMN, TVL_COLUMN, SIZE_COLUMN, APR_COLUMN]}
			linkFormatter={() => "/pool/token0:token1"}
		/>
	);
};

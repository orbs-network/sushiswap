import { DataTable } from "@sushiswap/ui";
import { APR_COLUMN, TVL_COLUMN, NAME_COLUMN } from "./PoolColumns";

type PoolsTableProps = {
	query: string;
};

export const PoolsTable = ({ query }: PoolsTableProps) => {
	return (
		<DataTable
			loading={false}
			data={[{ name: "hello", apr: "0" }]}
			columns={[NAME_COLUMN, TVL_COLUMN, APR_COLUMN]}
			linkFormatter={() => "/pool/0x"}
		/>
	);
};

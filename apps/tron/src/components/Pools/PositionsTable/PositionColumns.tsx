import { SkeletonText } from "@sushiswap/ui";
import { PositionSizeCell } from "./PositionSizeCell";

export const SIZE_COLUMN = {
	id: "size",
	header: "Size",
	cell: () => <PositionSizeCell />,
	meta: {
		skeleton: (
			<div className="flex items-center w-full gap-2">
				<div className="flex flex-col w-full">
					<SkeletonText fontSize="text-lg" />
				</div>
			</div>
		),
	},
};

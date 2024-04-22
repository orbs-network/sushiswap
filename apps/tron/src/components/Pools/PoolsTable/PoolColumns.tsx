import { SkeletonCircle, SkeletonText } from "@sushiswap/ui";
import { PoolNameCell } from "./PoolNameCell";
import { ICON_SIZE } from "src/constants/icon-size";
import { PoolAprCell } from "./PoolAprCell";
import { PoolTvlCell } from "./PoolTvlCell";

export const NAME_COLUMN = {
	id: "name",
	header: "Name",
	cell: () => <PoolNameCell />,
	meta: {
		skeleton: (
			<div className="flex items-center w-full gap-2">
				<div className="flex items-center">
					<SkeletonCircle radius={ICON_SIZE} />
					<SkeletonCircle radius={ICON_SIZE} className="-ml-[12px]" />
				</div>
				<div className="flex flex-col w-full">
					<SkeletonText fontSize="text-lg" />
				</div>
			</div>
		),
	},
};

export const TVL_COLUMN = {
	id: "TVL",
	header: "TVL",
	cell: () => <PoolTvlCell />,
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

export const APR_COLUMN = {
	id: "apr",
	header: "APR",
	cell: () => <PoolAprCell />,
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

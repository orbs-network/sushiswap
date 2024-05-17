import { Button, Slider } from "@sushiswap/ui";
import { useRemoveLiqDispatch, useRemoveLiqState } from "src/app/pool/[poolId]/remove/remove-provider";

const PercentageOptions = [25, 50, 75, 100];

export const RemoveInput = () => {
	const { percentage } = useRemoveLiqState();
	const { setPercentage } = useRemoveLiqDispatch();
	return (
		<div className="flex flex-col gap-6 dark:bg-slate-800 rounded-2xl bg-white px-5 py-6 border border-gray-900/10 dark:border-slate-200/10">
			<div className="flex w-full items-center justify-between">
				<div className="text-gray-900 dark:text-slate-50 text-3xl font-medium">{`${percentage}%`}</div>
				<div className="flex items-center gap-1">
					{PercentageOptions.map((option) => (
						<Button key={option} variant="secondary" onClick={() => setPercentage(option)}>
							{option === 100 ? "MAX" : `${option}%`}
						</Button>
					))}
				</div>
			</div>
			<Slider
				min={1}
				max={100}
				step={1}
				value={[percentage]}
				onValueChange={(value) => setPercentage(value[0])}
			/>
		</div>
	);
};

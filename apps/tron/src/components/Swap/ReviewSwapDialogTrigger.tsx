import { Button, Checkbox, DialogTrigger } from "@sushiswap/ui";
import { useMemo, useState } from "react";
// import { warningSeverity } from "src/utils/warning-severity";

export const ReviewSwapDialogTrigger = () => {
	const [isChecked, setIsChecked] = useState<boolean>(false);

	const userConfirmationNeeded = useMemo(() => {
		return false;
	}, []);

	return (
		<>
			<DialogTrigger disabled={userConfirmationNeeded && !isChecked} asChild>
				<Button size="lg">Enter Amount</Button>
			</DialogTrigger>
			{userConfirmationNeeded && !isChecked ? (
				<div
					onClick={() => setIsChecked(!isChecked)}
					className="flex items-start px-4 py-3 mt-4 rounded-xl bg-red/20 dark:bg-red/40 cursor-pointer">
					<Checkbox color="red" id="expert-checkbox" checked={isChecked} />
					<label htmlFor="expert-checkbox" className="ml-2 font-medium text-red-600 dark:text-red-300">
						Price impact is too high. You will lose a big portion of your funds in this trade. Please tick the
						box if you would like to continue.
					</label>
				</div>
			) : null}
		</>
	);
};

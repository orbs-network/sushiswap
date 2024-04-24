import { Button } from "@sushiswap/ui";
import { useState } from "react";

export const Rate = () => {
	const [showToken0First, setShowToken0First] = useState<boolean>(false);

	const handleToggleRate = () => {
		setShowToken0First(!showToken0First);
	};

	return (
		<div className="flex items-center gap-1">
			<Button size="xsm" variant="link" className="hover:!no-underline" onClick={handleToggleRate}>
				1 {showToken0First ? "TRX" : "USDC"} = {showToken0First ? "0.11" : "9.09"}{" "}
				{showToken0First ? "USDC" : "TRX"}
			</Button>
			<div className="text-[12px] opacity-40">{showToken0First ? "$0.11" : "$1.00"}</div>
		</div>
	);
};

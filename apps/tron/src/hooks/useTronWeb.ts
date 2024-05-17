import { useMemo } from "react";
import { IS_TESTNET } from "src/constants/is-testnet";
import TronWeb from "tronweb";

export const useTronWeb = () => {
	const tronWeb = useMemo(() => {
		const host = IS_TESTNET ? "https://api.shasta.trongrid.io/" : "https://api.trongrid.io/";
		return new TronWeb({
			fullHost: host,
			// headers: { "TRON-PRO-API-KEY": "5214a9b8-a52d-4fe4-ab62-c2e26758d3bd" },
		});
	}, []);
	return { tronWeb };
};

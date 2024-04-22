import { useMemo } from "react";
import { IS_TESTNET } from "src/constants/is-testnet";
import TronWeb from "tronweb";

export const useTronWeb = () => {
	const tronWeb = useMemo(() => {
		const host = IS_TESTNET ? "https://api.shasta.trongrid.io/" : "https://api.trongrid.io/";
		return new TronWeb({ fullHost: host });
	}, []);
	return { tronWeb };
};

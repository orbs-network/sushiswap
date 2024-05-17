import { useTronWeb } from "./useTronWeb";
import { useQuery } from "@tanstack/react-query";
import { useWallet } from "@tronweb3/tronwallet-adapter-react-hooks";
import { PAIR_ABI } from "../constants/abis/pair-abi";
import { isAddress } from "../utils/helpers";

export const usePoolOwnership = ({ pairAddress }: { pairAddress: string | undefined | null }) => {
	const { tronWeb } = useTronWeb();
	const { address } = useWallet();

	return useQuery({
		queryKey: ["usePoolOwnership", { pairAddress }],
		queryFn: async () => {
			if (!pairAddress || !tronWeb || !isAddress(pairAddress) || !address || !isAddress(address)) {
				return 0;
			}
			tronWeb.setAddress(pairAddress);
			const pairInstance = await tronWeb.contract(PAIR_ABI, pairAddress);
			const totalSupply = await pairInstance.totalSupply().call();
			// const ownedSupply = await pairInstance.balanceOf(address).call();
			const ownedSupply = await pairInstance.balanceOf("TPdthWzUHfepu2TEBimTFi1sBWtGYi3Ksa").call(); //TODO: remove hardcoded test address

			const ownership = ownedSupply / totalSupply;

			return ownership;
		},
		enabled: !!address && isAddress(address) && !!pairAddress && isAddress(pairAddress) && !!tronWeb,
	});
};

import { useTronWeb } from "./useTronWeb";
import { useQuery } from "@tanstack/react-query";
import { isAddress } from "src/utils/helpers";

export const useAllowance = ({
	tokenAddress,
	ownerAddress,
	spenderAddress,
}: {
	tokenAddress: string;
	ownerAddress: string;
	spenderAddress: string;
}) => {
	const { tronWeb } = useTronWeb();

	return useQuery({
		queryKey: ["useAllowance", { tokenAddress, ownerAddress, spenderAddress }],
		queryFn: async () => {
			tronWeb.setAddress(tokenAddress);
			const tokenContract = await tronWeb.contract().at(tokenAddress);
			const allowance = await tokenContract.allowance(ownerAddress, spenderAddress).call();

			return allowance?.toString() as string;
		},
		enabled: isAddress(tokenAddress) && isAddress(ownerAddress) && isAddress(spenderAddress) && !!tronWeb,
	});
};

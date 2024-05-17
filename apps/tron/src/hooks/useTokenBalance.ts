import { useTronWeb } from "./useTronWeb";
import { useQuery } from "@tanstack/react-query";

export const useTokenBalance = ({
	accountAddress,
	tokenAddress,
}: {
	accountAddress: string | null;
	tokenAddress: string | undefined;
}) => {
	const { tronWeb } = useTronWeb();

	return useQuery({
		queryKey: ["useTokenBalance", { accountAddress, tokenAddress }],
		queryFn: async () => {
			if (tokenAddress === "TRON") {
				const balance = await tronWeb.trx.getUnconfirmedBalance(accountAddress);
				return balance?.toString() as string;
			}
			tronWeb.setAddress(tokenAddress);
			const contractInstance = await tronWeb.contract().at(tokenAddress);
			const balanceOf = await contractInstance.balanceOf(accountAddress).call();
			return balanceOf?.toString() as string;
		},
		enabled: !!accountAddress && !!tokenAddress && !!tronWeb,
	});
};

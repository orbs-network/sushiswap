import { Metadata } from "next";
import { RemoveProvider } from "./remove-provider";

export const metadata: Metadata = {
	title: "Remove Liquidity",
};

export default function RemoveLiqLayout({ children }: { children: React.ReactNode }) {
	return <RemoveProvider>{children}</RemoveProvider>;
}

import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Pool",
};

export default function PoolLayout({ children }: { children: React.ReactNode }) {
	return children;
}

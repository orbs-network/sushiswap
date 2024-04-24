import { ReactNode } from "react";

export const Title = ({ children }: { children: ReactNode }) => {
	return (
		<h1 className="text-4xl font-medium text-gray-900 dark:text-slate-50 sm:max-h-[44px] mb-4">{children}</h1>
	);
};

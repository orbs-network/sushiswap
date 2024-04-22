export const truncateText = (str: string | `0x${string}`, n = 5): string => {
	if (str) {
		if (str.length <= n) {
			return str;
		}
		return `${str.slice(0, n)}...${str.slice(str.length - n)}`;
	}
	return "";
};

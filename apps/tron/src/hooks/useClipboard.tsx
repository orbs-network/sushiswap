import { useEffect, useState } from "react";
import { useCopyToClipboard } from "usehooks-ts";

export const useClipboard = () => {
	const [copiedText, copy] = useCopyToClipboard();
	const [isCopied, setIsCopied] = useState(false);

	const handleCopy = (text: string) => {
		copy(text);
		setIsCopied(true);
	};

	useEffect(() => {
		if (copiedText && isCopied) {
			setTimeout(() => {
				setIsCopied(false);
			}, 1000);
		}
	}, [copiedText, isCopied]);

	return { isCopied, handleCopy };
};

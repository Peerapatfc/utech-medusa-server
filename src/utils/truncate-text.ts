export const truncateText = (text: string, maxLength = 7, ellipsis = '…') => {
	if (!text) return '';
	if (text.length <= maxLength) return text;
	const textTrim = text.trim();

	return textTrim.slice(0, maxLength).trim() + ellipsis;
};

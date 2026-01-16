// input 1000 => output 1,000
export const formatPriceString = (price: number): string => {
	if (!price) return '0';

	return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// input 1000 => output 1,000.00
export const formatPriceWithDecimal = (price: number): string => {
	if (!price) return '0.00';

	return Number(price)
		.toFixed(2)
		.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

import { ProductDTO } from '@medusajs/framework/types';

const isNumber = (value: any): value is number => {
	return typeof value === 'number' && !Number.isNaN(value);
};

export const sortByIds = (
	products: ProductDTO[],
	ids: string[],
): ProductDTO[] => {
	if (!ids || ids.length === 0 || !products || products.length === 0) {
		return products || [];
	}
	const itemMap = new Map(products.map((item) => [item.id, item]));
	const ordered = ids.map((id) => itemMap.get(id)).filter(Boolean);
	return ordered;
};

const filterHasInventoryQuantity = (products: ProductDTO[]): ProductDTO[] => {
	return products.filter(
		(product) =>
			typeof product.metadata?.inventory_quantity === 'number' &&
			(product.metadata.inventory_quantity as number) > 0,
	);
};

const filterNoInventoryQuantity = (products: ProductDTO[]): ProductDTO[] => {
	return products.filter((product) => !product.metadata?.inventory_quantity);
};

export const sortByCollectionRank = (products: ProductDTO[]) => {
	const hasQuantityproducts = filterHasInventoryQuantity(products);
	const noQuantityProducts = filterNoInventoryQuantity(products);

	const sortedHasQuantityProducts = hasQuantityproducts.sort((a, b) => {
		const cARank = a.metadata?.collection_rank;
		const cBRank = b.metadata?.collection_rank;
		const aRank = isNumber(cARank) ? cARank : Number.MAX_SAFE_INTEGER;
		const bRank = isNumber(cBRank) ? cBRank : Number.MAX_SAFE_INTEGER;

		return aRank - bRank;
	});

	return [...sortedHasQuantityProducts, ...noQuantityProducts];
};

export const sortByPrice = (
	products: ProductDTO[],
	order: 'price_asc' | 'price_desc',
) => {
	const hasQuantityproducts = filterHasInventoryQuantity(products);
	const noQuantityProducts = filterNoInventoryQuantity(products);

	const sortedHasQuantityProducts = hasQuantityproducts.sort((a, b) => {
		const minAPrice = a.metadata?.min_calculated_price;
		const minBPrice = b.metadata?.min_calculated_price;
		const aPrice = isNumber(minAPrice) ? minAPrice : Number.MAX_SAFE_INTEGER;
		const bPrice = isNumber(minBPrice) ? minBPrice : Number.MAX_SAFE_INTEGER;

		if (order === 'price_asc') {
			return aPrice - bPrice;
		}

		return bPrice - aPrice;
	});

	return [...sortedHasQuantityProducts, ...noQuantityProducts];
};

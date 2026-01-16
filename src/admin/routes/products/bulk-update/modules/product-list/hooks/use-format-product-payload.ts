import type { HttpTypes } from '@medusajs/framework/types';
import { useCallback } from 'react';
import type {
	CurrencyPricesType,
	LocationQuantityType,
	ProductsType,
	RegionPricesType,
	VariantsType,
} from '../schema';

export const useFormatProductPayload = () => {
	const formatCurrencyPrices = useCallback(
		(currency_prices: CurrencyPricesType) => {
			const currencyPrices = Object.entries(currency_prices).filter(
				(currency_price) => {
					const [, currencyPriceData] = currency_price;
					if (currencyPriceData?.amount != null) return true;
				},
			);

			const formattedPrices = currencyPrices.map((currency_price) => {
				const [currency_code, currencyPriceData] = currency_price;
				return {
					currency_code,
					amount: Number(currencyPriceData?.amount),
				};
			});

			return formattedPrices;
		},
		[],
	);

	const formatRegionPrices = useCallback(
		(region_prices: RegionPricesType, regions: HttpTypes.AdminRegion[]) => {
			const regionPrices = Object.entries(region_prices).filter(
				(region_price) => {
					const [, regionPriceData] = region_price;
					if (regionPriceData?.amount) return true;
				},
			);

			const formattedPrices = regionPrices.map((region_price) => {
				const [region_id, regionPriceData] = region_price;
				const region = regions.find((r) => r.id === region_id);
				return {
					currency_code: region ? region.currency_code : '',
					amount: Number(regionPriceData?.amount),
					rules: { region_id },
				};
			});

			return formattedPrices;
		},
		[],
	);

	const formatQuantity = useCallback(
		(location_quantity: LocationQuantityType) => {
			const locationQuantities = Object.entries(location_quantity).filter(
				(location_quantity) => {
					const [, locationQuantityData] = location_quantity;
					if (locationQuantityData?.available_quantity != null) return true;
				},
			);

			const formattedQuantities = locationQuantities.map(
				(location_quantity) => {
					const [location_id, locationQuantityData] = location_quantity;
					return {
						location_id,
						inventory_item_id: locationQuantityData?.inventory_item_id,
						stocked_quantity: Number(locationQuantityData?.available_quantity),
					};
				},
			);

			return formattedQuantities;
		},
		[],
	);

	const formatVariants = useCallback(
		(
			variants: VariantsType,
			productId: string,
			regions: HttpTypes.AdminRegion[],
		) => {
			const arrayVariants = Object.entries(variants).map((variant) => {
				const [variant_id, variantData] = variant;
				return {
					product_id: productId,
					variant_id,
					prices: [
						...formatCurrencyPrices(variantData.currency_prices),
						...formatRegionPrices(variantData.region_prices, regions),
					],
					quantity: formatQuantity(variantData.location_quantity),
				};
			});
			return arrayVariants;
		},
		[formatCurrencyPrices, formatRegionPrices, formatQuantity],
	);

	const formatPayload = useCallback(
		(products: ProductsType, regions: HttpTypes.AdminRegion[]) => {
			const payload = Object.entries(products).flatMap((product) => {
				const [product_id, productData] = product;
				return formatVariants(productData.variants, product_id, regions);
			});
			return payload;
		},
		[formatVariants],
	);

	return {
		formatPayload,
	};
};

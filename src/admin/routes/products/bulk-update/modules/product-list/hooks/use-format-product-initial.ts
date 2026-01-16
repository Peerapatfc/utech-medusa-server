import type { HttpTypes } from '@medusajs/framework/types';
import { useCallback } from 'react';
import type { VariantsType } from '../schema';

interface AdminPriceWithRules extends HttpTypes.AdminPrice {
	rules?: { region_id?: string };
}

interface Props {
	stock_locations: HttpTypes.AdminStockLocation[] | undefined;
}
export const useFormatProductInitial = ({ stock_locations }: Props) => {
	const formatCurrencyPrices = useCallback((prices: AdminPriceWithRules[]) => {
		return prices.reduce(
			(acc, price) => {
				if (price.currency_code && !price.rules?.region_id) {
					acc[price.currency_code] = {
						amount: price.amount,
					};
				}
				return acc;
			},
			{} as Record<string, { amount: number }>,
		);
	}, []);

	const formatRegionPrices = useCallback((prices: AdminPriceWithRules[]) => {
		return prices.reduce(
			(acc, price) => {
				if (price.currency_code && price.rules?.region_id) {
					acc[price.rules.region_id] = {
						amount: price.amount,
					};
				}
				return acc;
			},
			{} as Record<string, { amount: number }>,
		);
	}, []);

	const formatQuantity = useCallback(
		(variant: HttpTypes.AdminProductVariant) => {
			return (
				stock_locations?.reduce(
					(acc, location) => {
						const level =
							variant?.inventory_items?.[0]?.inventory?.location_levels?.find(
								(lvl) => lvl.location_id === location.id,
							);
						acc[location.id] = {
							available_quantity: String(level?.available_quantity ?? 0),
							inventory_item_id:
								variant?.inventory_items?.[0]?.inventory_item_id ?? '',
						};
						return acc;
					},
					{} as Record<
						string,
						{ available_quantity: number | string; inventory_item_id: string }
					>,
				) || {}
			);
		},
		[stock_locations],
	);

	const formatProduct = useCallback(
		(product: HttpTypes.AdminProduct) => {
			return (
				product.variants?.reduce((variants, variant) => {
					const location_quantity = formatQuantity(variant);
					const currency_prices = formatCurrencyPrices(variant?.prices ?? []);
					const region_prices = formatRegionPrices(variant?.prices ?? []);

					variants[variant.id] = {
						currency_prices,
						region_prices,
						location_quantity,
					};
					return variants;
				}, {} as VariantsType) || {}
			);
		},
		[formatCurrencyPrices, formatRegionPrices, formatQuantity],
	);

	return {
		formatProduct,
	};
};

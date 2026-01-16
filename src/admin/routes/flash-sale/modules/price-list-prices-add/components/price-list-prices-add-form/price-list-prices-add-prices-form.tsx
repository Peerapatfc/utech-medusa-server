import type { HttpTypes } from '@medusajs/types';
import { useEffect } from 'react';
import { type UseFormReturn, useWatch } from 'react-hook-form';

import { DataGrid } from '../../../../../../components/data-grid';
import { useRouteModal } from '../../../../../../components/modals';
import { useProducts } from '../../../../../../hooks/api/products';
import { usePriceListGridColumns } from '../../../../common/hooks/use-price-list-grid-columns';
import type { PriceListCreateProductVariantsSchema } from '../../../../common/schemas';
import { isProductRow } from '../../../../common/utils';
import type { PriceListPricesAddSchema } from './schema';

type PriceListPricesAddPricesFormProps = {
	form: UseFormReturn<PriceListPricesAddSchema>;
	currencies: HttpTypes.AdminStoreCurrency[];
	regions: HttpTypes.AdminRegion[];
	pricePreferences: HttpTypes.AdminPricePreference[];
};

export const PriceListPricesAddPricesForm = ({
	form,
	currencies,
	regions,
	pricePreferences,
}: PriceListPricesAddPricesFormProps) => {
	const ids = useWatch({
		control: form.control,
		name: 'product_ids',
	});

	const existingProducts = useWatch({
		control: form.control,
		name: 'products',
	});

	const { products, isLoading, isError, error } = useProducts({
		id: ids.map((id) => id.id),
		limit: ids.length,
		fields:
			'title,thumbnail,*variants,*variants.inventory_items,*variants.inventory_items.inventory,*variants.inventory_items.inventory.location_levels',
	});

	const { setValue } = form;

	const { setCloseOnEscape } = useRouteModal();

	useEffect(() => {
		if (!isLoading && products) {
			products.map((product) => {
				/**
				 * If the product already exists in the form, we don't want to overwrite it.
				 */
				if (existingProducts[product.id] || !product.variants) {
					return;
				}

				setValue(`products.${product.id}.variants`, {
					...product.variants.reduce((variants, variant) => {
						const available_quantity = variant
							? (variant.inventory_items?.[0]?.inventory?.location_levels?.[0]
									?.available_quantity ?? 0)
							: 0;
						variants[variant.id] = {
							currency_prices: {},
							region_prices: {},
							flash_sale: {
								quantity: undefined,
								available_quantity,
							},
						};
						return variants;
					}, {} as PriceListCreateProductVariantsSchema),
				});
			});
		}
	}, [products, existingProducts, isLoading, setValue]);

	const columns = usePriceListGridColumns({
		currencies,
		regions,
		pricePreferences,
	});

	if (isError) {
		throw error;
	}

	return (
		<div className='flex size-full flex-col divide-y overflow-hidden'>
			<DataGrid
				isLoading={isLoading}
				columns={columns}
				data={products}
				getSubRows={(row) => {
					if (isProductRow(row) && row.variants) {
						return row.variants;
					}
				}}
				state={form}
				onEditingChange={(editing) => setCloseOnEscape(!editing)}
			/>
		</div>
	);
};

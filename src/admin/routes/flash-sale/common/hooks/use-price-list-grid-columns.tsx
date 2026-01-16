import type { HttpTypes } from '@medusajs/types';
import type { ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { Thumbnail } from '../../../../components/common/thumbnail';
import {
	createDataGridHelper,
	DataGrid,
} from '../../../../components/data-grid';
import { createDataGridPriceCustomColumns } from '../../../../components/data-grid/helpers/create-data-grid-price-custom-columns';
import type { PricingCreateSchemaType } from '../../modules/price-list-create/components/price-list-create-form/schema';
import { isProductRow } from '../utils';

const columnHelper = createDataGridHelper<
	HttpTypes.AdminProduct | HttpTypes.AdminProductVariant,
	PricingCreateSchemaType
>();

export const usePriceListGridColumns = ({
	currencies = [],
	regions = [],
	pricePreferences = [],
}: {
	currencies?: HttpTypes.AdminStoreCurrency[];
	regions?: HttpTypes.AdminRegion[];
	pricePreferences?: HttpTypes.AdminPricePreference[];
}) => {
	const { t } = useTranslation();

	const colDefs: ColumnDef<
		HttpTypes.AdminProduct | HttpTypes.AdminProductVariant
	>[] = useMemo(() => {
		return [
			columnHelper.column({
				id: t('fields.title'),
				header: t('fields.title'),
				cell: (context) => {
					const entity = context.row.original;
					if (isProductRow(entity)) {
						return (
							<DataGrid.ReadonlyCell context={context}>
								<div className='flex h-full w-full items-center gap-x-2 overflow-hidden'>
									<Thumbnail src={entity.thumbnail} size='small' />
									<span className='truncate'>{entity.title}</span>
								</div>
							</DataGrid.ReadonlyCell>
						);
					}

					return (
						<DataGrid.ReadonlyCell context={context}>
							<div className='flex h-full w-full items-center gap-x-2 overflow-hidden'>
								<span className='truncate'>{entity.title}</span>
							</div>
						</DataGrid.ReadonlyCell>
					);
				},
				disableHiding: true,
			}),
			...createDataGridPriceCustomColumns<
				HttpTypes.AdminProduct | HttpTypes.AdminProductVariant,
				PricingCreateSchemaType
			>({
				currencies: currencies.map((c) => c.currency_code),
				regions,
				pricePreferences,
				isReadyOnly: (context) => {
					const entity = context.row.original;
					return isProductRow(entity);
				},
				getFieldName: (context, value) => {
					const entity = context.row.original;

					if (isProductRow(entity)) {
						return null;
					}

					if (context.column.id?.startsWith('currency_prices')) {
						return `products.${entity.product_id}.variants.${entity.id}.currency_prices.${value}.amount`;
					}

					if (context.column.id?.startsWith('flash_sale')) {
						return `products.${entity.product_id}.variants.${entity.id}.flash_sale.quantity`;
					}

					return `products.${entity.product_id}.variants.${entity.id}.region_prices.${value}.amount`;
				},
				t,
			}),
			columnHelper.column({
				id: 'variant.quantity',
				header: 'Inventory Quantity',
				cell: (context) => {
					const entity = context.row.original;
					if (isProductRow(entity)) {
						return null;
					}
					const available_quantity = entity
						? (entity.inventory_items?.[0]?.inventory?.location_levels?.[0]
								?.available_quantity ?? 0)
						: 0;
					return (
						<DataGrid.ReadonlyCell context={context}>
							<div className='flex h-full w-full items-center gap-x-2 overflow-hidden'>
								<span className='truncate'>{available_quantity}</span>
							</div>
						</DataGrid.ReadonlyCell>
					);
				},
				disableHiding: true,
			}),
		];
	}, [t, currencies, regions, pricePreferences]);

	return colDefs;
};

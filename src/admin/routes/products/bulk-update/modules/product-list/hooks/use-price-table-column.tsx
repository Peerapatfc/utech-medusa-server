import type { HttpTypes } from '@medusajs/framework/types';
import type { ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Thumbnail } from '../../../../../../components/common/thumbnail';
import {
	DataGrid,
	createDataGridHelper,
} from '../../../../../../components/data-grid';
import { createDataGridPriceCustomColumns } from '../../../../../../components/data-grid/helpers/create-data-grid-price-custom-columns';
import { isProductRow } from '../../../../../flash-sale/common/utils';
import type { PricingCreateSchemaType } from '../../../../../flash-sale/modules/price-list-create/components/price-list-create-form/schema';

const columnHelper = createDataGridHelper<
	HttpTypes.AdminProduct | HttpTypes.AdminProductVariant,
	PricingCreateSchemaType
>();

interface Props {
	locations?: HttpTypes.AdminStockLocation[];
	currencies?: HttpTypes.AdminStoreCurrency[];
	regions?: HttpTypes.AdminRegion[];
	pricePreferences?: HttpTypes.AdminPricePreference[];
}

export const usePriceGridColumn = ({
	locations = [],
	currencies = [],
	regions = [],
	pricePreferences = [],
}: Props) => {
	const { t } = useTranslation();

	const colDefs: ColumnDef<
		HttpTypes.AdminProduct | HttpTypes.AdminProductVariant
	>[] = useMemo(() => {
		return [
			columnHelper.column({
				id: t('fields.title'),
				header: t('fields.title'),
				size: 300,
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
			...locations.map((location) =>
				columnHelper.column({
					id: `location_${location.id}`,
					name: location.name,
					header: location.name,
					type: 'number',
					field: (context) => {
						const entity = context.row.original;
						if (isProductRow(entity)) {
							return null;
						}
						return `products.${entity.product_id}.variants.${entity.id}.location_quantity.${location.id}.available_quantity`;
					},
					cell: (context) => {
						const entity = context.row.original;
						if (isProductRow(entity)) {
							return null;
						}
						return <DataGrid.NumberCell context={context} min={0} />;
					},
					disableHiding: true,
				}),
			),
		];
	}, [t, currencies, regions, pricePreferences, locations]);
	return colDefs.filter((col) => col.id !== 'flash_sale');
};

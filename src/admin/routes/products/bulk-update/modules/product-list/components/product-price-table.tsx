import type { HttpTypes } from '@medusajs/framework/types';
import { useEffect } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { DataGrid } from '../../../../../../components/data-grid';
import { useRouteModal } from '../../../../../../components/modals/route-modal-provider/use-route-modal';
import { useProducts } from '../../../../../../hooks/api/products';
import { useStockLocations } from '../../../../../../hooks/api/stock-locations';
import { isProductRow } from '../../../../../flash-sale/common/utils';
import { useFormatProductInitial } from '../hooks/use-format-product-initial';
import { usePriceGridColumn } from '../hooks/use-price-table-column';
import type { UpdateProductsVariantsType } from '../schema';

interface Props {
	form: UseFormReturn<UpdateProductsVariantsType>;
	currencies: HttpTypes.AdminStoreCurrency[];
	regions: HttpTypes.AdminRegion[];
	pricePreferences: HttpTypes.AdminPricePreference[];
}

const ProductPriceTable = ({
	form,
	currencies,
	regions,
	pricePreferences,
}: Props) => {
	const { setValue } = form;
	const productIds = form.watch('product_ids').map((product) => product.id);

	const existingProducts = form.watch('products');
	const { stock_locations } = useStockLocations({ fields: '-address' });

	const { products, isLoading, isError, error } = useProducts({
		id: productIds,
		limit: productIds.length,
		fields:
			'title,thumbnail,*variants,*variants.inventory_items,*variants.inventory_items.inventory,*variants.inventory_items.inventory.location_levels,variants.prices.*,*variants.prices.price_rules',
	});

	const columns = usePriceGridColumn({
		locations: stock_locations,
		currencies,
		regions,
		pricePreferences,
	});

	const { setCloseOnEscape } = useRouteModal();
	const { formatProduct } = useFormatProductInitial({ stock_locations });

	useEffect(() => {
		if (!isLoading && products) {
			products.map((product) => {
				if (existingProducts[product.id] || !product.variants) {
					return;
				}
				const updateProduct = formatProduct(product);
				setValue(`products.${product.id}.variants`, updateProduct);
			});
		}
	}, [products, existingProducts, isLoading, setValue, formatProduct]);

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

export default ProductPriceTable;

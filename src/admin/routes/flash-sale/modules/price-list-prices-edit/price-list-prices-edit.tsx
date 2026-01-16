import { useParams, useSearchParams } from 'react-router-dom';
import { RouteFocusModal } from '../../../../components/modals';
import { useFlashSale } from '../../../../hooks/api/flash-sales';
import { useProducts } from '../../../../hooks/api/products';
import { usePriceListCurrencyData } from '../../common/hooks/use-price-list-currency-data';
import { PriceListPricesEditForm } from './components/price-list-prices-edit-form';

export const PriceListPricesEdit = () => {
	const { id } = useParams();
	const [searchParams] = useSearchParams();
	const ids = searchParams.get('ids[]');

	// biome-ignore lint/style/noNonNullAssertion: <explanation>
	const { price_list, isLoading, isError, error } = useFlashSale(id!);
	const productIds = ids?.split(',');

	const {
		products,
		isLoading: isProductsLoading,
		isError: isProductsError,
		error: productError,
	} = useProducts({
		id: productIds,
		limit: productIds?.length || 9999, // Temporary until we support lazy loading in the DataGrid
		// biome-ignore lint/style/noNonNullAssertion: <explanation>
		price_list_id: [id!],
		fields:
			'title,thumbnail,*variants,*variants.inventory_items,*variants.inventory_items.inventory,*variants.inventory_items.inventory.location_levels',
	});

	const { isReady, regions, currencies, pricePreferences } =
		usePriceListCurrencyData();

	const ready =
		!isLoading && !!price_list && !isProductsLoading && !!products && isReady;

	if (isError) {
		throw error;
	}

	if (isProductsError) {
		throw productError;
	}

	return (
		<RouteFocusModal prev='../../'>
			<RouteFocusModal.Title asChild>
				<span className='sr-only'>Edit Prices for {price_list?.title}</span>
			</RouteFocusModal.Title>
			<RouteFocusModal.Description className='sr-only'>
				Update prices for products in the price list
			</RouteFocusModal.Description>
			{ready && (
				<PriceListPricesEditForm
					priceList={price_list}
					products={products}
					regions={regions}
					currencies={currencies}
					pricePreferences={pricePreferences}
				/>
			)}
		</RouteFocusModal>
	);
};

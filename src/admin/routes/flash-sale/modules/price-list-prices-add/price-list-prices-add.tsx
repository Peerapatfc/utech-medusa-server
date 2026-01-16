import { useParams } from 'react-router-dom';
import { RouteFocusModal } from '../../../../components/modals';
import { useFlashSale } from '../../../../hooks/api/flash-sales';
import { usePriceListCurrencyData } from '../../common/hooks/use-price-list-currency-data';
import { PriceListPricesAddForm } from './components/price-list-prices-add-form';

export const PriceListProductsAdd = () => {
	const { id } = useParams<{ id: string }>();

	// biome-ignore lint/style/noNonNullAssertion: <explanation>
	const { price_list, isPending, isError, error } = useFlashSale(id!);
	const { currencies, regions, pricePreferences, isReady } =
		usePriceListCurrencyData();

	const ready = isReady && !isPending && !!price_list;

	if (isError) {
		throw error;
	}

	return (
		<RouteFocusModal prev='../../'>
			{ready && (
				<PriceListPricesAddForm
					priceList={price_list}
					currencies={currencies}
					regions={regions}
					pricePreferences={pricePreferences}
				/>
			)}
		</RouteFocusModal>
	);
};

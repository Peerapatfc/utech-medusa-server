import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { RouteFocusModal } from '../../../../../components/modals';
import { usePriceListCurrencyData } from '../../../../../routes/flash-sale/common/hooks/use-price-list-currency-data';
import ProductProgressTabs from './components/product-progress-tab';
import { useCustomForm } from './hooks/use-custom-form';
export const ProductList = () => {
	const form = useCustomForm();
	const { currencies, regions, pricePreferences, isReady } =
		usePriceListCurrencyData();

	return (
		<RouteFocusModal>
			<RouteFocusDescription />
			<RouteFocusModal.Form form={form}>
				{isReady && (
					<ProductProgressTabs
						form={form}
						currencies={currencies}
						regions={regions}
						pricePreferences={pricePreferences}
					/>
				)}
			</RouteFocusModal.Form>
		</RouteFocusModal>
	);
};

const RouteFocusDescription = () => {
	return (
		<VisuallyHidden>
			<RouteFocusModal.Title>Bulk update products</RouteFocusModal.Title>
			<RouteFocusModal.Description>
				update price and stock quantity
			</RouteFocusModal.Description>
		</VisuallyHidden>
	);
};

import { Heading } from '@medusajs/ui';
// import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { RouteDrawer } from '../../../../components/modals';
import { useFlashSale } from '../../../../hooks/api/flash-sales';
import { PriceListEditForm } from './components/price-list-edit-form';

export const PriceListEdit = () => {
	// const { t } = useTranslation();
	const { id } = useParams();

	// biome-ignore lint/style/noNonNullAssertion: <explanation>
	const { price_list, isLoading, isError, error } = useFlashSale(id!);

	const ready = !isLoading && price_list;

	if (isError) {
		throw error;
	}

	return (
		<RouteDrawer>
			<RouteDrawer.Header>
				<Heading>
					{/* {t('priceLists.edit.header')} */}
					Edit Flash Sale
				</Heading>
			</RouteDrawer.Header>
			{ready && <PriceListEditForm priceList={price_list} />}
		</RouteDrawer>
	);
};

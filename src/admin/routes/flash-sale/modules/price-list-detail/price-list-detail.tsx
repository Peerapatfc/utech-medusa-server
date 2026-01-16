import { useParams } from 'react-router-dom';

import { useFlashSale } from '../../../../hooks/api/flash-sales';
import { PriceListConfigurationSection } from './components/price-list-configuration-section';
import { PriceListGeneralSection } from './components/price-list-general-section';
import { PriceListProductSection } from './components/price-list-product-section';

import { TwoColumnPageSkeleton } from '../../../../components/common/skeleton';
import { TwoColumnPage } from '../../../../components/layout/pages';
import BackButton from '../../../../components/back-button';

import PriceListEditRankProductSection from './components/price-list-edit-rank-product-section';

export const PriceListDetails = () => {
	const { id } = useParams();

	// biome-ignore lint/style/noNonNullAssertion: <explanation>
	const { price_list, isLoading, isError, error } = useFlashSale(id!);

	if (isLoading || !price_list) {
		return (
			<TwoColumnPageSkeleton mainSections={2} sidebarSections={1} showJSON />
		);
	}

	if (isError) {
		throw error;
	}

	return (
		<>
			<BackButton
				path='/flash-sale'
				label='Back to Flash Sale Lists'
				className='my-4'
			/>
			<TwoColumnPage data={price_list} showJSON>
				<TwoColumnPage.Main>
					<PriceListGeneralSection priceList={price_list} />
					<PriceListProductSection priceList={price_list} />
					<PriceListEditRankProductSection priceList={price_list} />
				</TwoColumnPage.Main>
				<TwoColumnPage.Sidebar>
					<PriceListConfigurationSection priceList={price_list} />
				</TwoColumnPage.Sidebar>
			</TwoColumnPage>
		</>
	);
};

import { Heading } from '@medusajs/ui';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { RouteDrawer } from '../../../../components/modals';
import { useCustomerGroups } from '../../../../hooks/api/customer-groups';
import { useFlashSale } from '../../../../hooks/api/flash-sales';
import { PriceListConfigurationForm } from './components/price-list-configuration-form';

export const PriceListConfiguration = () => {
	const { t } = useTranslation();
	const { id } = useParams();

	// biome-ignore lint/style/noNonNullAssertion: <explanation>
	const { price_list, isPending, isError, error } = useFlashSale(id!);

	const customerGroupIds = price_list?.rules?.['customer.groups.id'] as
		| string[]
		| undefined;

	const {
		customer_groups,
		isPending: isCustomerGroupsPending,
		isError: isCustomerGroupsError,
		error: customerGroupsError,
	} = useCustomerGroups(
		{
			id: customerGroupIds,
		},
		{ enabled: !!customerGroupIds?.length },
	);

	const initialCustomerGroups =
		customer_groups?.map((group) => ({
			id: group.id,
			// biome-ignore lint/style/noNonNullAssertion: <explanation>
			name: group.name!,
		})) || [];

	const isCustomerGroupsReady = isPending
		? false
		: !(!!customerGroupIds?.length && isCustomerGroupsPending);

	const ready = !isPending && !!price_list && isCustomerGroupsReady;

	if (isError) {
		throw error;
	}

	if (isCustomerGroupsError) {
		throw customerGroupsError;
	}

	return (
		<RouteDrawer>
			<RouteDrawer.Header>
				<RouteDrawer.Title asChild>
					<Heading>{t('priceLists.configuration.edit.header')}</Heading>
				</RouteDrawer.Title>
			</RouteDrawer.Header>
			{ready && (
				<PriceListConfigurationForm
					priceList={price_list}
					customerGroups={initialCustomerGroups}
				/>
			)}
		</RouteDrawer>
	);
};

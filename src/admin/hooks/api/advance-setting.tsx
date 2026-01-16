import { useQuery } from '@tanstack/react-query';
import { ConfigDataPath } from '../../../types/config-data';
import { sdk } from '../../lib/client';
export const useMagentoOrderURL = () => {
	const { data: magentoResponse } = useQuery({
		queryFn: () =>
			sdk.client.fetch<{ data: { value: string }[] }>(
				`/admin/config-data?paths=${ConfigDataPath.MAGENTO_ORDER_HISTORY_URL}`,
			),
		queryKey: [
			'magento-order-history-url',
			{ id: 'magento/order/history-url' },
		],
	});
	return magentoResponse?.data[0]?.value ?? '';
};

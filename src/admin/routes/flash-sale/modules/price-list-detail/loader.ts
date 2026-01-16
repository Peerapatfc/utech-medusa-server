import type { LoaderFunctionArgs } from 'react-router-dom';
import { flashSalesQueryKeys } from '../../../../hooks/api/flash-sales';
import { sdk } from '../../../../lib/client';
import { queryClient } from '../../../../lib/query-client';

const pricingDetailQuery = (id: string) => ({
	queryKey: flashSalesQueryKeys.detail(id),
	queryFn: async () => sdk.admin.priceList.retrieve(id),
});

export const pricingLoader = async ({ params }: LoaderFunctionArgs) => {
	const id = params.id;
	// biome-ignore lint/style/noNonNullAssertion: <explanation>
	const query = pricingDetailQuery(id!);

	return queryClient.ensureQueryData(query);
};

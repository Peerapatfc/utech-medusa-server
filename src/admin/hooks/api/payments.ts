import type { HttpTypes } from '@medusajs/types';
import {
	type QueryKey,
	useQuery,
	type UseQueryOptions,
} from '@tanstack/react-query';
import { sdk } from '../../lib/client';
import { queryKeysFactory } from '../../lib/query-key-factory';
import type { FetchError } from '@medusajs/js-sdk';

const PAYMENT_QUERY_KEY = 'payment' as const;
export const paymentQueryKeys = queryKeysFactory(PAYMENT_QUERY_KEY);

export const usePaymentProviders = (
	query?: HttpTypes.AdminGetPaymentProvidersParams,
	options?: Omit<
		UseQueryOptions<
			HttpTypes.AdminGetPaymentProvidersParams,
			FetchError,
			HttpTypes.AdminPaymentProviderListResponse,
			QueryKey
		>,
		'queryKey' | 'queryFn'
	>,
) => {
	const { data, ...rest } = useQuery({
		queryFn: async () => sdk.admin.payment.listPaymentProviders(query),
		queryKey: [],
		...options,
	});

	return { ...data, ...rest };
};

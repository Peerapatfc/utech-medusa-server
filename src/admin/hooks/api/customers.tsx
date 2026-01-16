import type { FetchError } from '@medusajs/js-sdk';
import type { HttpTypes, PaginatedResponse } from '@medusajs/types';
import {
	type QueryKey,
	type UseQueryOptions,
	useQuery,
} from '@tanstack/react-query';
import { sdk } from '../../lib/client';
import { queryKeysFactory } from '../../lib/query-key-factory';

const CUSTOMERS_QUERY_KEY = 'customers' as const;
export const customersQueryKeys = queryKeysFactory(CUSTOMERS_QUERY_KEY);

export const useCustomer = (
	id: string,
	query?: Record<string, unknown>,
	options?: Omit<
		UseQueryOptions<
			{ customer: HttpTypes.AdminCustomer },
			FetchError,
			{ customer: HttpTypes.AdminCustomer },
			QueryKey
		>,
		'queryFn' | 'queryKey'
	>,
) => {
	const { data, ...rest } = useQuery({
		queryKey: customersQueryKeys.detail(id),
		queryFn: async () => sdk.admin.customer.retrieve(id, query),
		...options,
	});

	return { ...data, ...rest };
};

export const useCustomers = (
	query?: Record<string, unknown>,
	options?: Omit<
		UseQueryOptions<
			PaginatedResponse<{ customers: HttpTypes.AdminCustomer[] }>,
			FetchError,
			PaginatedResponse<{ customers: HttpTypes.AdminCustomer[] }>,
			QueryKey
		>,
		'queryFn' | 'queryKey'
	>,
) => {
	const { data, ...rest } = useQuery({
		queryFn: () => sdk.admin.customer.list(query),
		queryKey: customersQueryKeys.list(query),
		...options,
	});

	return { ...data, ...rest };
};

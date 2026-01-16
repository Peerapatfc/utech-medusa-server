import type { FetchError } from '@medusajs/js-sdk';
import type { HttpTypes } from '@medusajs/types';
import {
	type QueryKey,
	type UseMutationOptions,
	type UseQueryOptions,
	useMutation,
	useQuery,
} from '@tanstack/react-query';
import { sdk } from '../../lib/client';
import { queryClient } from '../../lib/query-client';
import { queryKeysFactory } from '../../lib/query-key-factory';

const PRICE_LISTS_QUERY_KEY = 'price-lists' as const;
export const priceListsQueryKeys = queryKeysFactory(PRICE_LISTS_QUERY_KEY);

export const usePriceLists = (
	query?: HttpTypes.AdminPriceListListParams,
	options?: Omit<
		UseQueryOptions<
			HttpTypes.AdminPriceListListResponse,
			FetchError,
			HttpTypes.AdminPriceListListResponse,
			QueryKey
		>,
		'queryKey' | 'queryFn'
	>,
) => {
	const { data, ...rest } = useQuery({
		// queryFn: () => sdk.admin.priceList.list(query),
		queryFn: () =>
			sdk.client.fetch<HttpTypes.AdminPriceListListResponse>(
				'/admin/custom/price-lists',
				{ query },
			),
		queryKey: priceListsQueryKeys.list(query),
		...options,
	});

	return { ...data, ...rest };
};

export const useDeletePriceListLazy = (
	options?: UseMutationOptions<
		HttpTypes.AdminPriceListDeleteResponse,
		FetchError,
		{ id: string }
	>,
) => {
	return useMutation({
		mutationFn: ({ id }) => sdk.admin.priceList.delete(id),
		onSuccess: (data, variables, context) => {
			queryClient.invalidateQueries({
				queryKey: priceListsQueryKeys.lists(),
			});
			queryClient.invalidateQueries({
				queryKey: priceListsQueryKeys.detail(variables.id),
			});

			options?.onSuccess?.(data, variables, context);
		},
		...options,
	});
};

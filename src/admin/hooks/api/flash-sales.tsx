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
import { customerGroupsQueryKeys } from './customer-groups';
import { productsQueryKeys } from './products';
import type { PriceSetCustomDTO } from '@customTypes/price-set';

const FLASH_SALES_QUERY_KEY = 'flash-sales' as const;
export const flashSalesQueryKeys = queryKeysFactory(FLASH_SALES_QUERY_KEY);

export const useFlashSale = (
	id: string,
	query?: HttpTypes.AdminPriceListListParams,
	options?: Omit<
		UseQueryOptions<
			HttpTypes.AdminPriceListResponse,
			FetchError,
			HttpTypes.AdminPriceListResponse,
			QueryKey
		>,
		'queryKey' | 'queryFn'
	>,
) => {
	const { data, ...rest } = useQuery({
		queryFn: () => sdk.admin.priceList.retrieve(id, query),
		queryKey: flashSalesQueryKeys.detail(id),
		...options,
	});

	return { ...data, ...rest };
};

export const getFlashSale = async (
	id: string,
	query?: HttpTypes.AdminPriceListListParams,
) => {
	return await sdk.admin.priceList.retrieve(id, {
		...query,
		fields: [
			'id',
			'type',
			'description',
			'title',
			'status',
			'starts_at',
			'ends_at',
			'created_at',
			'updated_at',
			'deleted_at',
			'price_list_rules.value',
			'price_list_rules.attribute',
			'prices.id',
			'prices.currency_code',
			'prices.amount',
			'prices.min_quantity',
			'prices.max_quantity',
			'prices.created_at',
			'prices.deleted_at',
			'prices.updated_at',
			'prices.price_set.variant.id',
			'prices.price_rules.value',
			'prices.price_rules.attribute',
			'*price_list_custom',
			'*price_list_custom.price_list_variants',
			'*price_list_custom.price_list_variants.product_variant',
		].join(','),
	});
};

export const usePriceSets = async (
	priceSetIds?: string[],
): Promise<{ result: PriceSetCustomDTO[] }> => {
	return await fetch(
		`/admin/custom/price-sets${priceSetIds && priceSetIds.length > 0 ? `?ids=${priceSetIds.join(',')}` : ''}`,
		{
			credentials: 'include',
			method: 'GET',
			headers: { 'Content-Type': 'application/json' },
		},
	).then((res) => res.json());
};

export const useFlashSales = (
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
		queryFn: () =>
			sdk.client.fetch<HttpTypes.AdminPriceListListResponse>(
				'/admin/custom/flash-sales',
				{ query },
			),
		queryKey: flashSalesQueryKeys.list(query),
		...options,
	});

	return { ...data, ...rest };
};

export const useUpdateFlashSale = (
	id: string,
	query?: HttpTypes.AdminPriceListParams,
	options?: UseMutationOptions<
		HttpTypes.AdminPriceListResponse,
		FetchError,
		HttpTypes.AdminUpdatePriceList
	>,
) => {
	return useMutation({
		mutationFn: (payload) => sdk.admin.priceList.update(id, payload, query),
		onSuccess: (data, variables, context) => {
			queryClient.invalidateQueries({ queryKey: flashSalesQueryKeys.lists() });
			queryClient.invalidateQueries({
				queryKey: flashSalesQueryKeys.details(),
			});

			queryClient.invalidateQueries({ queryKey: customerGroupsQueryKeys.all });

			options?.onSuccess?.(data, variables, context);
		},
		...options,
	});
};

export const useDeleteFlashSale = (
	id: string,
	options?: UseMutationOptions<
		HttpTypes.AdminPriceListDeleteResponse,
		FetchError,
		void
	>,
) => {
	return useMutation({
		mutationFn: () => sdk.admin.priceList.delete(id),
		onSuccess: (data, variables, context) => {
			queryClient.invalidateQueries({ queryKey: flashSalesQueryKeys.lists() });

			options?.onSuccess?.(data, variables, context);
		},
		...options,
	});
};

export const usePriceListLinkProducts = (
	id: string,
	options?: UseMutationOptions<
		HttpTypes.AdminPriceListResponse,
		FetchError,
		HttpTypes.AdminLinkPriceListProducts
	>,
) => {
	return useMutation({
		mutationFn: (payload) => sdk.admin.priceList.linkProducts(id, payload),
		onSuccess: (data, variables, context) => {
			queryClient.invalidateQueries({
				queryKey: flashSalesQueryKeys.detail(id),
			});
			queryClient.invalidateQueries({ queryKey: flashSalesQueryKeys.lists() });
			queryClient.invalidateQueries({ queryKey: productsQueryKeys.lists() });

			options?.onSuccess?.(data, variables, context);
		},
		...options,
	});
};

export const removePriceListLinkProducts = async (
	id: string,
	productIds: string[],
) => {
	return await fetch(
		`/admin/custom/flash-sales/${id}/products?productIds=${productIds.join(',')}`,
		{
			credentials: 'include',
			method: 'DELETE',
			headers: { 'Content-Type': 'application/json' },
		},
	).then((res) => res.json());
};

export const useDeleteFlashSaleLazy = (
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
				queryKey: flashSalesQueryKeys.lists(),
			});
			queryClient.invalidateQueries({
				queryKey: flashSalesQueryKeys.detail(variables.id),
			});

			options?.onSuccess?.(data, variables, context);
		},
		...options,
	});
};

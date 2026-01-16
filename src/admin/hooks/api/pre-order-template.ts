import type { FetchError } from '@medusajs/js-sdk';
import {
	type QueryKey,
	type UseMutationOptions,
	type UseQueryOptions,
	useMutation,
	useQuery,
} from '@tanstack/react-query';
import { sdk } from '../../lib/client';
import { queryKeysFactory } from '../../lib/query-key-factory';
import { queryClient } from '../../lib/query-client';
import type { PickupOption, PreOrderTemplate } from '@customTypes/pre-order';
import type { HttpTypes } from '@medusajs/framework/types';

const PRE_ORDER_TEMPLATE_QUERY_KEY = 'pre_order_templates' as const;
export const preOrderTemplatesQueryKeys = queryKeysFactory(
	PRE_ORDER_TEMPLATE_QUERY_KEY,
);

export const usePreOrderTemplate = (
	id: string,
	query?: HttpTypes.FindParams,
	options?: Omit<
		UseQueryOptions<
			{
				pre_order_template: PreOrderTemplate;
				products: HttpTypes.AdminProduct[];
			},
			FetchError,
			{
				pre_order_template: PreOrderTemplate;
				products: HttpTypes.AdminProduct[];
			},
			QueryKey
		>,
		'queryKey' | 'queryFn'
	>,
) => {
	const { data, ...rest } = useQuery({
		queryFn: () =>
			sdk.client.fetch<{
				pre_order_template: PreOrderTemplate;
				products: HttpTypes.AdminProduct[];
			}>(`/admin/pre-order/templates/${id}`, {
				query,
			}),
		queryKey: preOrderTemplatesQueryKeys.detail(id),
		...options,
	});

	return { ...data, ...rest };
};

export const usePreOrderTemplates = (
	query?: HttpTypes.FindParams,
	options?: Omit<
		UseQueryOptions<
			{
				pre_order_templates: PreOrderTemplate[];
				count: number;
			},
			FetchError,
			{
				pre_order_templates: PreOrderTemplate[];
				count: number;
			},
			QueryKey
		>,
		'queryKey' | 'queryFn'
	>,
) => {
	const { data, ...rest } = useQuery({
		queryFn: () =>
			sdk.client.fetch<{
				pre_order_templates: PreOrderTemplate[];
				count: number;
			}>('/admin/pre-order/templates', { query }),
		queryKey: preOrderTemplatesQueryKeys.list(query),
		...options,
	});

	return { ...data, ...rest };
};

export const useCreatePreOrderTemplate = (
	options?: UseMutationOptions<
		PreOrderTemplate,
		FetchError,
		{
			name_th: string;
			name_en: string;
			shipping_start_date: string | null;
			pickup_start_date: string | null;
			upfront_price: number;
		}
	>,
) => {
	return useMutation({
		mutationFn: (payload) =>
			sdk.client.fetch<PreOrderTemplate>('/admin/pre-order/templates', {
				method: 'POST',
				body: payload,
			}),
		onSuccess: (data, variables, context) => {
			queryClient.invalidateQueries({
				queryKey: preOrderTemplatesQueryKeys.lists(),
			});
			queryClient.invalidateQueries({
				queryKey: preOrderTemplatesQueryKeys.detail(data.id as string),
			});

			options?.onSuccess?.(data, variables, context);
		},
		...options,
	});
};

export const useUpdatePreOrderTemplate = (
	id: string,
	options?: UseMutationOptions<
		PreOrderTemplate,
		FetchError,
		{
			name_th: string;
			name_en: string;
			shipping_start_date: string | null;
			pickup_start_date: string | null;
			upfront_price: number;
		}
	>,
) => {
	return useMutation({
		mutationFn: (payload) =>
			sdk.client.fetch(`/admin/pre-order/templates/${id}`, {
				method: 'POST',
				body: payload,
			}),
		onSuccess: (data, variables, context) => {
			queryClient.invalidateQueries({
				queryKey: preOrderTemplatesQueryKeys.detail(id),
			});
			queryClient.invalidateQueries({
				queryKey: preOrderTemplatesQueryKeys.lists(),
			});

			options?.onSuccess?.(data, variables, context);
		},
		...options,
	});
};

export const useDeletePreOrderTemplate = (
	id: string,
	options?: UseMutationOptions<{ success: true }, FetchError>,
) => {
	return useMutation({
		mutationFn: () =>
			sdk.client.fetch<{ success: true }>(`/admin/pre-order/templates/${id}`, {
				method: 'DELETE',
			}),
		onSuccess: (data, variables, context) => {
			queryClient.invalidateQueries({
				queryKey: preOrderTemplatesQueryKeys.detail(id),
			});
			queryClient.invalidateQueries({
				queryKey: preOrderTemplatesQueryKeys.lists(),
			});

			options?.onSuccess?.(data, variables, context);
		},
		...options,
	});
};

export const useUnAddedProductsTemplates = (
	id: string,
	options?: Omit<
		UseQueryOptions<
			{
				products: HttpTypes.AdminProduct[];
				count: number;
			},
			FetchError,
			{
				products: HttpTypes.AdminProduct[];
				count: number;
			},
			QueryKey
		>,
		'queryKey' | 'queryFn'
	>,
) => {
	const { data, ...rest } = useQuery({
		queryFn: () =>
			sdk.client.fetch<{
				products: HttpTypes.AdminProduct[];
				count: number;
			}>(`/admin/pre-order/templates/${id}/unadded-products`),
		queryKey: preOrderTemplatesQueryKeys.list({}),
		...options,
	});

	return { ...data, ...rest };
};

export const useAddProductsToPreOrderPreOrderTemplate = (
	options?: UseMutationOptions<
		PreOrderTemplate,
		FetchError,
		{
			id: string;
			product_ids: string[];
		}
	>,
) => {
	return useMutation({
		mutationFn: (payload) =>
			sdk.client.fetch(`/admin/pre-order/templates/${payload.id}/products`, {
				method: 'POST',
				body: {
					product_ids: payload.product_ids,
				},
			}),
		onSuccess: (data, variables, context) => {
			queryClient.invalidateQueries({
				queryKey: preOrderTemplatesQueryKeys.list(),
			});

			options?.onSuccess?.(data, variables, context);
		},
		...options,
	});
};

// export const useDeleteCollection = (
// 	id: string,
// 	options?: UseMutationOptions<
// 		HttpTypes.AdminCollectionDeleteResponse,
// 		FetchError,
// 		void
// 	>,
// ) => {
// 	return useMutation({
// 		mutationFn: () => sdk.admin.productCollection.delete(id),
// 		onSuccess: (data, variables, context) => {
// 			queryClient.invalidateQueries({ queryKey: collectionsQueryKeys.lists() });
// 			queryClient.invalidateQueries({
// 				queryKey: collectionsQueryKeys.detail(id),
// 			});

// 			options?.onSuccess?.(data, variables, context);
// 		},
// 		...options,
// 	});
// };

export const useRemoveProductsFromPreOrderTemplate = (
	id: string,
	options?: UseMutationOptions<
		{
			success: boolean;
		},
		FetchError,
		{
			product_id: string;
		}
	>,
) => {
	return useMutation({
		mutationFn: ({ product_id }) =>
			sdk.client.fetch<{ success: boolean }>(
				`/admin/pre-order/templates/${id}/products/${product_id}`,
				{
					method: 'DELETE',
				},
			),
		onSuccess: (data, variables, context) => {
			queryClient.invalidateQueries({
				queryKey: preOrderTemplatesQueryKeys.detail(id),
			});
			queryClient.invalidateQueries({
				queryKey: preOrderTemplatesQueryKeys.list(),
			});

			options?.onSuccess?.(data, variables, context);
		},
		...options,
	});
};

// export const useUpdateProductType = (
// 	id: string,
// 	options?: UseMutationOptions<
// 		HttpTypes.AdminProductTypeResponse,
// 		FetchError,
// 		HttpTypes.AdminUpdateProductType
// 	>,
// ) => {
// 	return useMutation({
// 		mutationFn: (payload) => sdk.admin.productType.update(id, payload),
// 		onSuccess: (data, variables, context) => {
// 			queryClient.invalidateQueries({
// 				queryKey: productTypesQueryKeys.detail(id),
// 			});
// 			queryClient.invalidateQueries({
// 				queryKey: productTypesQueryKeys.lists(),
// 			});

// 			options?.onSuccess?.(data, variables, context);
// 		},
// 		...options,
// 	});
// };

// export const useDeleteProductType = (
// 	id: string,
// 	options?: UseMutationOptions<
// 		HttpTypes.AdminProductTypeDeleteResponse,
// 		FetchError,
// 		void
// 	>,
// ) => {
// 	return useMutation({
// 		mutationFn: () => sdk.admin.productType.delete(id),
// 		onSuccess: (data, variables, context) => {
// 			queryClient.invalidateQueries({
// 				queryKey: productTypesQueryKeys.detail(id),
// 			});
// 			queryClient.invalidateQueries({
// 				queryKey: productTypesQueryKeys.lists(),
// 			});

// 			options?.onSuccess?.(data, variables, context);
// 		},
// 		...options,
// 	});
// };

export const usePreOrderUnAddedProductsTemplate = (
	id: string,
	query?: HttpTypes.FindParams,
	options?: Omit<
		UseQueryOptions<
			{
				products: HttpTypes.AdminProduct[];
			},
			FetchError,
			{
				products: HttpTypes.AdminProduct[];
			},
			QueryKey
		>,
		'queryKey' | 'queryFn'
	>,
) => {
	const { data, ...rest } = useQuery({
		queryFn: () =>
			sdk.client.fetch<{
				products: HttpTypes.AdminProduct[];
			}>(`/admin/pre-order/templates/${id}/unadded-products`, {
				query,
			}),
		queryKey: preOrderTemplatesQueryKeys.detail(id),
		...options,
	});

	return { ...data, ...rest };
};

export const usePickupOptionsTemplate = (
	query?: HttpTypes.FindParams,
	options?: Omit<
		UseQueryOptions<
			{
				pickup_options: PickupOption[];
			},
			FetchError,
			{
				pickup_options: PickupOption[];
			},
			QueryKey
		>,
		'queryKey' | 'queryFn'
	>,
) => {
	const { data, ...rest } = useQuery({
		queryFn: () =>
			sdk.client.fetch<{
				pickup_options: PickupOption[];
			}>('/admin/pre-order/pickup-options', {
				query,
			}),
		queryKey: preOrderTemplatesQueryKeys.list(),
		...options,
	});

	return { ...data, ...rest };
};

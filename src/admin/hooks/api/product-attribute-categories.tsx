import type { FetchError } from '@medusajs/js-sdk';
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
import type {
	ProductAttribute,
	ProductAttributeCategory,
} from '../../types/attribute';
import type { AdminProductAttributeCategoryListParams } from '../table/query/use-product-attribute-category-table-query';

// Define update type based on ProductAttributeCategory
type ProductAttributeCategoryUpdate = Partial<
	Omit<ProductAttributeCategory, 'id' | 'created_at' | 'updated_at'>
>;

const PRODUCT_ATTRIBUTE_CATEGORY_QUERY_KEY =
	'product-attribute-category' as const;
export const productAttributeCategoryQueryKeys = queryKeysFactory(
	PRODUCT_ATTRIBUTE_CATEGORY_QUERY_KEY,
);

export const useProductAttributeCategory = (
	id: string,
	options?: Omit<
		UseQueryOptions<
			ProductAttributeCategory,
			FetchError,
			ProductAttributeCategory,
			QueryKey
		>,
		'queryFn' | 'queryKey'
	>,
) => {
	const { data, ...rest } = useQuery({
		queryKey: productAttributeCategoryQueryKeys.detail(id),
		queryFn: async () => {
			const response = await sdk.client.fetch<{
				category: ProductAttributeCategory;
			}>(`/admin/product-attribute-categories/${id}`, {
				method: 'GET',
			});
			return response.category;
		},
		...options,
	});

	return { product_attribute_category: data, ...rest };
};

export const useProductAttributeCategories = (
	query?: AdminProductAttributeCategoryListParams,
	options?: Omit<
		UseQueryOptions<
			{ categories: ProductAttributeCategory[]; count: number },
			FetchError,
			{ categories: ProductAttributeCategory[]; count: number },
			QueryKey
		>,
		'queryFn' | 'queryKey'
	>,
) => {
	const { data, ...rest } = useQuery({
		queryKey: productAttributeCategoryQueryKeys.list(query),
		queryFn: async () => {
			const queryString = query
				? Object.entries(query)
						.map(([key, value]) => {
							if (value === undefined || value === null) return '';
							return `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`;
						})
						.filter(Boolean)
						.join('&')
				: '';
			const response = await sdk.client.fetch<{
				categories: ProductAttributeCategory[];
				count: number;
			}>(
				`/admin/product-attribute-categories${queryString ? `?${queryString}` : ''}`,
				{
					method: 'GET',
				},
			);
			return {
				categories: response.categories || [],
				count: response.count || 0,
			};
		},
		...options,
	});

	return {
		categories: data?.categories || [],
		count: data?.count || 0,
		...rest,
	};
};

export const useCreateProductAttributeCategory = (
	options?: UseMutationOptions<
		{ category: ProductAttributeCategory },
		FetchError,
		ProductAttributeCategoryUpdate
	>,
) => {
	return useMutation({
		mutationFn: async (payload) => {
			return await sdk.client.fetch<{ category: ProductAttributeCategory }>(
				'/admin/product-attribute-categories',
				{
					method: 'POST',
					body: payload,
				},
			);
		},
		onSuccess: (data, variables, context) => {
			queryClient.invalidateQueries({
				queryKey: productAttributeCategoryQueryKeys.lists(),
			});
			options?.onSuccess?.(data, variables, context);
		},
		...options,
	});
};

export const useUpdateProductAttributeCategory = (
	id: string,
	options?: UseMutationOptions<
		{ category: ProductAttributeCategory },
		FetchError,
		Partial<ProductAttributeCategoryUpdate>
	>,
) => {
	return useMutation({
		mutationFn: async (payload) => {
			return await sdk.client.fetch<{ category: ProductAttributeCategory }>(
				`/admin/product-attribute-categories/${id}`,
				{
					method: 'PUT',
					body: payload,
				},
			);
		},
		onSuccess: (data, variables, context) => {
			queryClient.invalidateQueries({
				queryKey: productAttributeCategoryQueryKeys.lists(),
			});
			queryClient.invalidateQueries({
				queryKey: productAttributeCategoryQueryKeys.detail(id),
			});
			options?.onSuccess?.(data, variables, context);
		},
		...options,
	});
};

export const useDeleteProductAttributeCategory = (
	id: string,
	options?: UseMutationOptions<void, FetchError, void>,
) => {
	return useMutation({
		mutationFn: async () => {
			const response = await fetch(
				`/admin/product-attribute-categories/${id}`,
				{
					method: 'DELETE',
					credentials: 'include',
				},
			);

			if (!response.ok) {
				const errorText = await response.text().catch(() => 'Unknown error');
				throw new Error(errorText || response.statusText || 'Delete failed');
			}

			return;
		},
		onSuccess: (data, variables, context) => {
			queryClient.invalidateQueries({
				queryKey: productAttributeCategoryQueryKeys.lists(),
			});
			queryClient.invalidateQueries({
				queryKey: productAttributeCategoryQueryKeys.detail(id),
			});
			options?.onSuccess?.(data, variables, context);
		},
		...options,
	});
};

export const useCategoryAttributes = (
	categoryId: string,
	options?: Omit<
		UseQueryOptions<
			ProductAttribute[],
			FetchError,
			ProductAttribute[],
			QueryKey
		>,
		'queryFn' | 'queryKey'
	>,
) => {
	const { data, ...rest } = useQuery({
		queryKey: [
			...productAttributeCategoryQueryKeys.detail(categoryId),
			'attributes',
		],
		queryFn: async () => {
			const response = await sdk.client.fetch<{
				attributes: ProductAttribute[];
			}>(`/admin/product-attribute-categories/${categoryId}/attributes`, {
				method: 'GET',
			});
			return response.attributes || [];
		},
		...options,
	});

	return { attributes: data || [], ...rest };
};

// export const useDeleteCollection = (
//   id: string,
//   options?: UseMutationOptions<
//     HttpTypes.AdminCollectionDeleteResponse,
//     FetchError,
//     void
//   >
// ) => {
//   return useMutation({
//     mutationFn: () => sdk.admin.productCollection.delete(id),
//     onSuccess: (data, variables, context) => {
//       queryClient.invalidateQueries({ queryKey: collectionsQueryKeys.lists() })
//       queryClient.invalidateQueries({
//         queryKey: collectionsQueryKeys.detail(id),
//       })

//       options?.onSuccess?.(data, variables, context)
//     },
//     ...options,
//   })
// }

// Add hooks for adding and removing attributes to/from categories
export const useAddAttributesToCategory = (
	categoryId: string,
	options?: UseMutationOptions<
		{ success: boolean; attributes: ProductAttribute[] },
		FetchError,
		{ attribute_ids: string[] }
	>,
) => {
	return useMutation({
		mutationFn: async (payload) => {
			const response = await sdk.client.fetch<{
				success: boolean;
				attributes: ProductAttribute[];
			}>(`/admin/product-attribute-categories/${categoryId}/attributes`, {
				method: 'POST',
				body: payload,
			});
			return response;
		},
		onSuccess: (data, variables, context) => {
			queryClient.invalidateQueries({
				queryKey: [
					...productAttributeCategoryQueryKeys.detail(categoryId),
					'attributes',
				],
			});
			options?.onSuccess?.(data, variables, context);
		},
		...options,
	});
};

export const useRemoveAttributesFromCategory = (
	categoryId: string,
	options?: UseMutationOptions<
		{ success: boolean; attributes: ProductAttribute[] },
		FetchError,
		{ attribute_ids: string[] }
	>,
) => {
	return useMutation({
		mutationFn: async (payload) => {
			const response = await sdk.client.fetch<{
				success: boolean;
				attributes: ProductAttribute[];
			}>(`/admin/product-attribute-categories/${categoryId}/attributes`, {
				method: 'DELETE',
				body: payload,
			});
			return response;
		},
		onSuccess: (data, variables, context) => {
			queryClient.invalidateQueries({
				queryKey: [
					...productAttributeCategoryQueryKeys.detail(categoryId),
					'attributes',
				],
			});
			options?.onSuccess?.(data, variables, context);
		},
		...options,
	});
};

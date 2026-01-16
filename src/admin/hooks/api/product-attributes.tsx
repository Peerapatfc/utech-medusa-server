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
import type { ProductAttribute } from '../../types/attribute';

const PRODUCT_ATTRIBUTE_QUERY_KEY = 'product-attributes' as const;
export const productAttributeQueryKeys = queryKeysFactory(
	PRODUCT_ATTRIBUTE_QUERY_KEY,
);

interface ProductAttributesParams {
	status?: string;
}

/**
 * Hook to fetch all product attributes
 */
export const useProductAttributes = (
	queryParams?: ProductAttributesParams,
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
		queryKey: productAttributeQueryKeys.list(queryParams || {}),
		queryFn: async () => {
			let url = '/admin/product-attributes';
			if (queryParams && Object.keys(queryParams).length > 0) {
				const params = new URLSearchParams();
				for (const [key, value] of Object.entries(queryParams)) {
					if (value !== undefined) {
						params.append(key, String(value));
					}
				}
				url += `?${params.toString()}`;
			}

			const response = await sdk.client.fetch<{
				attributes: ProductAttribute[];
			}>(url, {
				method: 'GET',
			});
			return response.attributes;
		},
		...options,
	});

	return { attributes: data || [], ...rest };
};

/**
 * Hook to fetch attributes assigned to a specific category
 */
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
		queryKey: ['category-attributes', categoryId],
		queryFn: async () => {
			if (!categoryId) {
				return [];
			}

			const response = await sdk.client.fetch<{
				attributes: ProductAttribute[];
			}>(`/admin/product-attribute-categories/${categoryId}/attributes`, {
				method: 'GET',
			});
			return response.attributes;
		},
		enabled: !!categoryId,
		...options,
	});

	return { attributes: data || [], ...rest };
};

/**
 * Hook to add attributes to a category
 */
export const useAddAttributesToCategory = (
	categoryId: string,
	options?: UseMutationOptions<
		{
			success: boolean;
			message: string;
			attributes: ProductAttribute[];
			details?: {
				successes: number;
				failures: number;
				errors: string[];
			};
		},
		FetchError,
		string[]
	>,
) => {
	return useMutation({
		mutationFn: async (attributeIds: string[]) => {
			return await sdk.client.fetch<{
				success: boolean;
				message: string;
				attributes: ProductAttribute[];
				details?: {
					successes: number;
					failures: number;
					errors: string[];
				};
			}>(`/admin/product-attribute-categories/${categoryId}/attributes`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: { attribute_ids: attributeIds },
			});
		},
		onSuccess: (data, variables, context) => {
			// Invalidate relevant queries
			queryClient.invalidateQueries({
				queryKey: ['category-attributes', categoryId],
			});
			queryClient.invalidateQueries({
				queryKey: productAttributeQueryKeys.lists(),
			});
			options?.onSuccess?.(data, variables, context);
		},
		...options,
	});
};

/**
 * Hook to remove attributes from a category
 */
export const useRemoveAttributesFromCategory = (
	categoryId: string,
	options?: UseMutationOptions<
		{
			success: boolean;
			message: string;
			attributes: ProductAttribute[];
			details?: {
				successes: number;
				failures: number;
				errors: string[];
			};
		},
		FetchError,
		string[]
	>,
) => {
	return useMutation({
		mutationFn: async (attributeIds: string[]) => {
			return await sdk.client.fetch<{
				success: boolean;
				message: string;
				attributes: ProductAttribute[];
				details?: {
					successes: number;
					failures: number;
					errors: string[];
				};
			}>(`/admin/product-attribute-categories/${categoryId}/attributes`, {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
				},
				body: { attribute_ids: attributeIds },
			});
		},
		onSuccess: (data, variables, context) => {
			// Invalidate relevant queries
			queryClient.invalidateQueries({
				queryKey: ['category-attributes', categoryId],
			});
			queryClient.invalidateQueries({
				queryKey: productAttributeQueryKeys.lists(),
			});
			options?.onSuccess?.(data, variables, context);
		},
		...options,
	});
};

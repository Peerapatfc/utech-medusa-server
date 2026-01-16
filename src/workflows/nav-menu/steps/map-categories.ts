import type { ProductCategoryDTO, ProductDTO } from '@medusajs/framework/types';
import { createStep, StepResponse } from '@medusajs/framework/workflows-sdk';
import { ProductStatus } from '@medusajs/framework/utils';

const buildFullPathUrl = (
	category: ProductCategoryDTO,
	parentPath = '',
): string => {
	const currentHandle = category.handle || '';
	return parentPath ? `${parentPath}/${currentHandle}` : currentHandle;
};

// Step to map categories to the required response format
const mapCategoriesResponseStep = createStep(
	'map-categories-response-step',
	async (categories: ProductCategoryDTO[]) => {
		const mapCategoryChildren = (
			children: ProductCategoryDTO[],
			parentPath = '',
		) => {
			if (!children || !Array.isArray(children)) return [];

			return children.map((child) => {
				const fallbackThumbnail = !child.metadata?.thumbnail
					? getMostRecentProductThumbnail(child.products)
					: null;

				const fullPathUrl = buildFullPathUrl(child, parentPath);

				return {
					id: child.id || '',
					handle: child.handle || '',
					title: child.name || '',
					icon: child.metadata?.icon || '',
					thumbnail: child.metadata?.thumbnail || fallbackThumbnail,
					full_path_url: `/${fullPathUrl}`,
					brands: [],
					category_children: mapCategoryChildren(
						child.category_children,
						fullPathUrl,
					),
				};
			});
		};

		const mappedCategories = categories.map((category) => {
			const fallbackThumbnail = !category.metadata?.thumbnail
				? getMostRecentProductThumbnail(category.products)
				: null;

			const fullPathUrl = buildFullPathUrl(category);

			return {
				id: category.id || '',
				handle: category.handle || '',
				title: category.name || '',
				icon: category.metadata?.icon || '',
				thumbnail: category.metadata?.thumbnail || fallbackThumbnail,
				full_path_url: `/${fullPathUrl}`,
				brands: [],
				category_children: mapCategoryChildren(
					category.category_children,
					fullPathUrl,
				),
				products: mergeAllProductInCategory(category),
			};
		});

		return new StepResponse(mappedCategories);
	},
);

const mergeAllProductInCategory = (
	category: ProductCategoryDTO,
): ProductDTO[] => {
	const productMap = new Map<string, ProductDTO>();

	const collectProducts = (cat: ProductCategoryDTO) => {
		cat.products?.forEach((product) => productMap.set(product.id, product));
		cat.category_children?.forEach(collectProducts);
	};

	collectProducts(category);

	return Array.from(productMap.values());
};

const getMostRecentProductThumbnail = (
	products: ProductDTO[] = [],
): string | null => {
	if (!products || products.length === 0) return null;

	const publishedProductsWithThumbnails = products
		.filter(
			(product) =>
				product.status === ProductStatus.PUBLISHED && product.thumbnail,
		)
		.sort((a, b) => {
			const dateA =
				typeof a.updated_at === 'string'
					? new Date(a.updated_at)
					: a.updated_at;
			const dateB =
				typeof b.updated_at === 'string'
					? new Date(b.updated_at)
					: b.updated_at;
			return dateB.getTime() - dateA.getTime();
		});

	return publishedProductsWithThumbnails.length > 0
		? publishedProductsWithThumbnails[0].thumbnail
		: null;
};

export default mapCategoriesResponseStep;

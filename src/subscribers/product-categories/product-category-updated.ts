import type {
	Logger,
	SubscriberArgs,
	SubscriberConfig,
} from '@medusajs/medusa';
import type { IProductModuleService } from '@medusajs/types';
import { ProductEvents } from '@medusajs/utils';
import { Modules } from '@medusajs/utils';
import { PRODUCT_CATEGORY_STRAPI_MODULE } from '../../modules/strapi/product-categories';
import type ProductCategoryStrapiService from '../../modules/strapi/product-categories/service';

// subscriber function
export default async function productCategoryUpdatedHandler({
	event: { data },
	container,
}: SubscriberArgs<{ id: string }>) {
	const categoryId = data.id;
	const logger: Logger = container.resolve('logger');
	const productService: IProductModuleService = container.resolve(
		Modules.PRODUCT,
	);
	const productCategoryStrapiModuleService: ProductCategoryStrapiService =
		container.resolve(PRODUCT_CATEGORY_STRAPI_MODULE);

	const category = await productService.retrieveProductCategory(categoryId, {
		select: ['*'],
	});

	const existingCategory =
		await productCategoryStrapiModuleService.getProductCategoryByMedusaId(
			category.id,
		);
	let strapi_id = null;

	if (existingCategory) {
		const updated =
			await productCategoryStrapiModuleService.updateProductCategory(
				existingCategory.id,
				{
					name: category.name,
					handle: category.handle,
					medusa_id: category.id,
					is_active: category.is_active,
					is_internal: category.is_internal,
				},
			);
		strapi_id = updated.id;
	} else {
		const created =
			await productCategoryStrapiModuleService.createProductCategory({
				name: category.name,
				handle: category.handle,
				medusa_id: category.id,
				is_active: category.is_active,
				is_internal: category.is_internal,
			});
		strapi_id = created.id;
	}

	if (!category.metadata || strapi_id !== category.metadata.strapi_id) {
		await productService.updateProductCategories(category.id, {
			metadata: {
				...(category.metadata || {}),
				strapi_id: strapi_id,
			},
		});
	}

	return logger.info(`The product-category ${categoryId} was updated`);
}

// subscriber config
export const config: SubscriberConfig = {
	event: ProductEvents.PRODUCT_CATEGORY_UPDATED,
};

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
export default async function productCategoryCreatedHandler({
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
	const create = await productCategoryStrapiModuleService.createProductCategory(
		{
			name: category.name,
			handle: category.handle,
			medusa_id: category.id,
			is_active: category.is_active,
			is_internal: category.is_internal,
		},
	);
	if (create) {
		await productService.updateProductCategories(category.id, {
			metadata: {
				...category.metadata,
				strapi_id: create.id,
			},
		});
	}
	return logger.info(`The product-category ${categoryId} was created`);
}

// subscriber config
export const config: SubscriberConfig = {
	event: ProductEvents.PRODUCT_CATEGORY_CREATED,
};

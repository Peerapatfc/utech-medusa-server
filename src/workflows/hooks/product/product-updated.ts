import type { Logger } from '@medusajs/framework/types';
import { Modules } from '@medusajs/framework/utils';
import { updateProductsWorkflow } from '@medusajs/medusa/core-flows';
import { IProductModuleService, ProductTypes } from '@medusajs/types';
import { ADMIN_MODULE } from '../../../modules/admin';
import type AdminModuleService from '../../../modules/admin/service';

updateProductsWorkflow.hooks.productsUpdated(
	async ({ products, additional_data }, { container }) => {
		const logger: Logger = container.resolve('logger');
		const adminService: AdminModuleService = container.resolve(ADMIN_MODULE);
		const productService: IProductModuleService = container.resolve(
			Modules.PRODUCT,
		);

		try {
			// Process each product
			for (const product of products) {
				// Always create admin logs, whether additional_data exists or not
				adminService.createAdminLogs({
					action: 'updated',
					resource_id: product.id,
					resource_type: 'product',
					actor_id: (additional_data?.actor_id as string) || '',
				});

				// Process tags and categories if provided in additional_data
				if (additional_data) {
					// Handle tag_ids if present
					if (
						additional_data.tag_ids &&
						Array.isArray(additional_data.tag_ids) &&
						additional_data.tag_ids.length > 0
					) {
						try {
							logger.info(`Updating tags for product ${product.id}`);
							// Using correct method signature: updateProducts(selector, update)
							await productService.updateProducts({ id: product.id }, {
								tag_ids: additional_data.tag_ids,
							} as ProductTypes.UpdateProductDTO);
						} catch (tagError) {
							logger.warn(
								`Failed to update tags for product ${product.id}: ${tagError.message}`,
							);
						}
					}

					// Handle category_ids if present
					if (
						additional_data.category_ids &&
						Array.isArray(additional_data.category_ids) &&
						additional_data.category_ids.length > 0
					) {
						try {
							logger.info(`Updating categories for product ${product.id}`);
							// Using correct method signature: updateProducts(selector, update)
							await productService.updateProducts({ id: product.id }, {
								category_ids: additional_data.category_ids,
							} as ProductTypes.UpdateProductDTO);
						} catch (categoryError) {
							logger.warn(
								`Failed to update categories for product ${product.id}: ${categoryError.message}`,
							);
						}
					}
				}
			}
		} catch (error) {
			logger.warn(`Error in product updated hook: ${error?.message}`);
		}
	},
);

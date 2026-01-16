import type { SubscriberConfig } from '@medusajs/framework';
import type { IProductModuleService, Logger } from '@medusajs/framework/types';
import {
	Modules,
	ProductVariantWorkflowEvents,
} from '@medusajs/framework/utils';
import updateProductSearchMetadataWorkflow from '../../workflows/product/update-product-search-metadata';

export default async function productVariantUpdatedHandler({
	event,
	container,
}) {
	const logger: Logger = container.resolve('logger');
	const variantId = event.data.id;
	logger.info(
		`Product variant created event [ ProductVariantWorkflowEvents.CREATED ], variantId: ${variantId}`,
	);

	const productService: IProductModuleService = container.resolve(
		Modules.PRODUCT,
	);
	const variant = await productService.retrieveProductVariant(variantId);
	const productId = variant.product.id;

	if (productId) {
		await updateProductSearchMetadataWorkflow(container).run({
			input: {
				productId: [productId],
			},
		});
	}
}

export const config: SubscriberConfig = {
	event: ProductVariantWorkflowEvents.CREATED,
};

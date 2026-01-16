import type { SubscriberConfig } from '@medusajs/framework';
import type { IProductModuleService, Logger } from '@medusajs/framework/types';
import { Modules, ProductEvents } from '@medusajs/framework/utils';
import productCreatedWorkflow from '../../workflows/product/product-created-workflow';

export default async function productCreatedHandler({ event, container }) {
	const logger: Logger = container.resolve('logger');
	const productId = event.data.id;
	logger.info(
		`Product created event [ProductEvents.PRODUCT_CREATED], product: ${productId}`,
	);
	const productModuleService: IProductModuleService = container.resolve(
		Modules.PRODUCT,
	);
	const product = await productModuleService.retrieveProduct(productId, {
		relations: ['type'],
	});
	const isServiceType = product.type?.value === 'Service';
	if (isServiceType) {
		return;
	}

	try {
		await productCreatedWorkflow(container).run({
			input: {
				id: productId,
			},
		});
	} catch (error) {
		logger.error(`Error running product created workflow: ${error?.message}`);
	}
}

export const config: SubscriberConfig = {
	event: ProductEvents.PRODUCT_CREATED,
};

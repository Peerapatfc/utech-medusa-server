import { updateCartWorkflow } from '@medusajs/medusa/core-flows';
import type { Logger } from '@medusajs/medusa/types';

updateCartWorkflow.hooks.cartUpdated(async ({ cart }, { container }) => {
	const logger: Logger = container.resolve('logger');
	logger.info('Cart updated hook called');
	// console.log({ cart });
});

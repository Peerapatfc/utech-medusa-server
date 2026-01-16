import type { Logger, MedusaContainer } from '@medusajs/framework/types';
import { STOREFRONT_MODULE } from '../modules/storefront';
import type StorefrontModuleService from '../modules/storefront/service';

export default async function revalidateTags(container: MedusaContainer) {
	if (process.env.NODE_ENV === 'development') {
		return;
	}

	const logger: Logger = container.resolve('logger');
	const storefrontService: StorefrontModuleService =
		container.resolve(STOREFRONT_MODULE);

	storefrontService.revalidateTags([
		'custom-products',
		'flash-sales',
		'top-searches',
	]);

	logger.info('[cron]: Revalidated tags for custom-products and flash-sales');
}

export const config = {
	name: 'storefront-revalidate-tags',
	//  every midnight
	schedule: '0 0 * * *',
	// every 10 minutes
	// schedule: '*/10 * * * *',
};

import { MedusaContainer } from '@medusajs/framework/types';
import { syncProductsWorkflow } from '../workflows/product/sync-products';
import { ContainerRegistrationKeys } from '@medusajs/framework/utils';

export default async function syncProductsJob(container: MedusaContainer) {
	const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
	if (process.env.NODE_ENV === 'development') {
		logger.info('[cron]: Sync products job is disabled in development mode');
		return;
	}

	logger.info('[cron]: Sync products job is starting...');

	try {
		await syncProductsWorkflow(container).run();
	} catch (error) {
		logger.error('[cron]: Sync products job failed', error);
		return;
	}

	logger.info('[cron]: Sync products job is completed');
}

export const config = {
	name: 'sync-products-job',
	schedule: '0 * * * *', // every hour
};

import type { Logger, MedusaContainer } from '@medusajs/framework/types';
import buildNavMenuWorkflow from '../workflows/nav-menu';

export default async function buildNavMenuToCache(container: MedusaContainer) {
	if (process.env.NODE_ENV === 'development') {
		return;
	}

	const logger: Logger = container.resolve('logger');

	await buildNavMenuWorkflow(container).run({
		input: {
			isCached: true,
		},
	});

	logger.info('[cron]: Built nav menu and cached it successfully');
}

export const config = {
	name: 'build-nav-menu-to-cache',
	schedule: '0 0 * * *', // Every day at midnight
};

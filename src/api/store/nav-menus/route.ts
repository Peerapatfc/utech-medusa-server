import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import buildNavMenuWorkflow from '../../../workflows/nav-menu';
import { Modules } from '@medusajs/framework/utils';

// const CACHE_TTL = process.env.CACHE_TTL
// 	? Number.parseInt(process.env.CACHE_TTL, 10)
// 	: 86400; // Default to 24 hours

export async function GET(
	req: MedusaRequest,
	res: MedusaResponse,
): Promise<void> {
	const logger = req.scope.resolve('logger');

	const cacheModuleService = req.scope.resolve(Modules.CACHE);
	const cachedResponse = await cacheModuleService.get('nav_menus');
	if (cachedResponse) {
		logger.info('Serving nav menus from cache');
		res.json({
			nav_menus: cachedResponse,
		});
		return;
	}

	try {
		const { result } = await buildNavMenuWorkflow(req.scope).run({
			input: {
				isCached: true,
			},
		});

		const response = {
			nav_menus: {
				categories: result.categories,
				collections: result.collections,
				brands: result.brands,
			},
		};

		// await cacheModuleService.set('nav_menus', response, CACHE_TTL);

		res.json({
			...response,
		});
	} catch (error) {
		logger.error('Error building navigation menu:', error?.message);
		res.status(500).json({ error: 'Failed to build navigation menu' });
	}
}

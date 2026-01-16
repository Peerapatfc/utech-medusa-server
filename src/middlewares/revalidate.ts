import type {
	MedusaNextFunction,
	MedusaRequest,
	MedusaResponse,
	MiddlewareRoute,
} from '@medusajs/framework/http';
import { STOREFRONT_MODULE } from '../modules/storefront';
import type StorefrontModuleService from '../modules/storefront/service';
import type { IProductModuleService, Logger } from '@medusajs/framework/types';
// import { Modules } from '@medusajs/framework/utils';

const revalidateCampaignPromotions = async (
	req: MedusaRequest,
	_res: MedusaResponse,
	next: MedusaNextFunction,
) => {
	const logger: Logger = req.scope.resolve('logger');
	const storefrontService: StorefrontModuleService =
		req.scope.resolve(STOREFRONT_MODULE);
	storefrontService.revalidateTags(['coupons']);

	logger.info('Revalidate [coupons] tags from Middleware');
	next();
};

const revalidateCollections = async (
	req: MedusaRequest,
	_res: MedusaResponse,
	next: MedusaNextFunction,
) => {
	const logger: Logger = req.scope.resolve('logger');
	// const id = req.params.id;

	// const productService: IProductModuleService = req.scope.resolve(
	// 	Modules.PRODUCT,
	// );
	const storefrontService: StorefrontModuleService =
		req.scope.resolve(STOREFRONT_MODULE);

	// const productCollection = await productService.retrieveProductCollection(id);

	storefrontService.revalidateTags([
		'collections',
		// `collections-${id}`,
		// `collections-${productCollection?.handle}`,
	]);

	logger.info('Revalidate [collections] tags from Middleware');
	next();
};

export const revalidateRoutesMiddlewares: MiddlewareRoute[] = [
	{
		method: ['POST'],
		matcher: '/admin/campaigns/:id/promotions',
		middlewares: [revalidateCampaignPromotions],
	},
	{
		method: ['POST'],
		matcher: '/admin/collections/:id',
		middlewares: [revalidateCollections],
	},
];

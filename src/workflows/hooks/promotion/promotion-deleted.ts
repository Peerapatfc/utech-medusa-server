import { deletePromotionsWorkflow } from '@medusajs/medusa/core-flows';
import { STOREFRONT_MODULE } from '../../../modules/storefront';
import type StorefrontModuleService from '../../../modules/storefront/service';

deletePromotionsWorkflow.hooks.promotionsDeleted(async (_, { container }) => {
	const storefrontService: StorefrontModuleService =
		container.resolve(STOREFRONT_MODULE);
	await storefrontService.revalidateTag('coupons');
});

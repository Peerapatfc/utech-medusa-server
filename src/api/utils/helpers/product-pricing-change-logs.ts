import type {
	AuthenticatedMedusaRequest,
	MedusaNextFunction,
	MedusaResponse,
} from '@medusajs/framework/http';
import type {
	HttpTypes,
	IPricingModuleService,
	Logger,
} from '@medusajs/framework/types';
import { Modules } from '@medusajs/framework/utils';
import type AdminModuleService from '../../../modules/admin/service';
import { ADMIN_MODULE } from '../../../modules/admin';

export const logUpdadeProductPricing = async (
	req: AuthenticatedMedusaRequest<HttpTypes.AdminBatchProductVariantRequest>,
	_res: MedusaResponse,
	next: MedusaNextFunction,
) => {
	const { auth_context } = req;
	const actor_id = auth_context?.actor_id || '';
	const { id: productId } = req.params;
	const pricingService: IPricingModuleService = req.scope.resolve(
		Modules.PRICING,
	);
	const adminService: AdminModuleService = req.scope.resolve(ADMIN_MODULE);
	const logger: Logger = req.scope.resolve('logger');
	try {
		const updates = req.body.update;
		for await (const updateVarianPrice of updates) {
			const { id: variantId, prices } = updateVarianPrice;
			for await (const price of prices) {
				// biome-ignore lint/complexity/useLiteralKeys: <explanation>
				const priceId = price['id'];
				const amount = price.amount;
				if (!priceId) continue;

				const oldPrice = await pricingService
					.listPrices(
						{
							id: priceId,
						},
						{
							take: 1,
						},
					)
					.then((prices) => prices[0]);
				if (!oldPrice) continue;

				const isPriceChanged = oldPrice.amount !== amount;
				if (!isPriceChanged) continue;

				adminService.createProductPricingLogs({
					previous_amount: oldPrice.amount as number,
					new_amount: amount,
					product_id: productId,
					variant_id: variantId,
					price_id: priceId,
					actor_id,
					metadata: {
						action: 'update',
					},
				});

				adminService.createAdminLogs({
					action: 'updated',
					resource_id: priceId,
					resource_type: 'price',
					actor_id,
					metadata: {
						product_id: productId,
						variant_id: variantId,
					},
				});
			}
		}

		next();
	} catch (error) {
		logger.error(`Error logging inventory item update: ${error?.message}`);
		next();
	}
};

import type {
	AuthenticatedMedusaRequest,
	MedusaResponse,
} from '@medusajs/framework';
import { Modules } from '@medusajs/framework/utils';
import { PERSONALIZATION_MODULE } from '../../../../../../modules/personalization';
import PersonalizationModuleService from '../../../../../../modules/personalization/service';
// import updateProductScoreWorkflow from '../../../../../../workflows/product/update-products-score-workflow';

export const POST = async (
	req: AuthenticatedMedusaRequest,
	res: MedusaResponse,
) => {
	const id = req.params.id;
	const productService = req.scope.resolve(Modules.PRODUCT);
	const personalizationService: PersonalizationModuleService =
		req.scope.resolve(PERSONALIZATION_MODULE);

	const product = await productService.retrieveProduct(id);
	if (!product) {
		return res.status(404).json({
			success: false,
			message: 'Product not found',
		});
	}

	const customerId = req.auth_context?.actor_id;
	const guestId = req.headers['x-guest-id'] as string | undefined;
	if (!customerId && !guestId) {
		return res.status(400).json({
			success: false,
			message: 'Either customer_id or guest_id must be provided',
		});
	}

	personalizationService.recordProductView({
		product_id: id,
		customer_id: customerId || null,
		guest_id: guestId || null,
	});

	// const viewCount = (product.metadata?.view as number) || 0;
	// const newViewCount = viewCount + 1;
	// await productService.updateProducts(id, {
	// 	metadata: {
	// 		...product.metadata,
	// 		view: newViewCount,
	// 	},
	// });

	// updateProductScoreWorkflow(req.scope).run({
	// 	input: {
	// 		productIds: [id],
	// 	},
	// });

	return res.status(200).json({
		success: true,
	});
};

import type { MedusaRequest, MedusaResponse } from '@medusajs/framework';
import updateProductScoreWorkflow from '../../../../workflows/product/update-products-score-workflow';
import syncProductMeilisearchWorkflowV2 from '../../../../workflows/product/sync-meilisearch-v2';

interface WishlistPayload {
	product_ids: string[];
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
	const { product_ids } = req.body as WishlistPayload;

	//call the workflow
	await updateProductScoreWorkflow(req.scope).run({
		input: {
			productIds: product_ids,
		},
	});

	syncProductMeilisearchWorkflowV2(req.scope).run({
		input: {
			productIds: product_ids,
		},
	});

	return res.status(200).json({
		success: true,
	});
};

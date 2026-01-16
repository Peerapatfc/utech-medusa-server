import {
	WorkflowResponse,
	createWorkflow,
} from '@medusajs/framework/workflows-sdk';
import { getPaidCountStep } from './steps/get-paid-count';
import { getProductViewCountStep } from './steps/get-product-view-count';
import { getWishlistCountStep } from './steps/get-wishlist-count';
import { summaryScoreStep } from './steps/summary-score';
import { updateSummaryScoreStep } from './steps/update-summary-score';
import { revalidateStoreTagsStep } from '../../common';

export type WorkflowInput = {
	// productIds : ['product_id1', 'product_id2']
	productIds: string[];
};

const updateProductScoreWorkflow = createWorkflow(
	'update-products-score-workflow',
	(input: WorkflowInput) => {
		// step1: get view count of the products
		//------ return [ { id: 'product_id1', viewCount: 10 }, { id: 'product_id2', viewCount: 20 } ]

		const { productViewCount } = getProductViewCountStep({
			product_ids: input.productIds,
		});

		// step2: get wishlist count of the products
		//------ return [ { id: 'product_id1', wishlistCount: 10 }, { id: 'product_id2', wishlistCount: 20 } ]
		const { wishlistCount } = getWishlistCountStep({
			product_ids: input.productIds,
		});

		// step3: get paid count of the products
		//------ return [ { id: 'product_id1', paidCount: 10 }, { id: 'product_id2', paidCount: 20 } ]
		const { paidCount } = getPaidCountStep({
			product_ids: input.productIds,
		});

		// step4: sum the view count, wishlist count and paid count of the products
		//------ return [ { id: 'product_id1', score: 10 }, { id: 'product_id2', score: 20 } ]
		const { summaryScore } = summaryScoreStep({
			productViewCount: productViewCount,
			wishlistCount: wishlistCount,
			paidCount: paidCount,
		});

		// step5: update the products with the new score
		const { success } = updateSummaryScoreStep({
			summaryScore,
			wishlistCount,
		});

		revalidateStoreTagsStep({
			tags: ['top-searches'],
		});

		return new WorkflowResponse({
			success: success,
		});
	},
);

export default updateProductScoreWorkflow;

import type { IProductModuleService } from '@medusajs/framework/types';
import { Modules } from '@medusajs/framework/utils';
import { StepResponse, createStep } from '@medusajs/framework/workflows-sdk';

type StepInput = {
	summaryScore: { id: string; score: number }[];
	wishlistCount: { id: string; wishlistCount: number }[];
};

export const updateSummaryScoreStep = createStep(
	'update-summary-score-step',
	async ({ summaryScore, wishlistCount }: StepInput, { container }) => {
		const productService: IProductModuleService = container.resolve(
			Modules.PRODUCT,
		);

		const productScoreUpdatePromises = summaryScore.map(
			async ({ id, score }) => {
				const product = await productService.retrieveProduct(id);
				const wishlistProduct = wishlistCount.find((w) => w.id === id);
				return productService.updateProducts(id, {
					metadata: {
						...product.metadata,
						suggestion_score: score,
						wishlist_count: wishlistProduct?.wishlistCount || 0,
					},
				});
			},
		);

		await Promise.all(productScoreUpdatePromises);

		return new StepResponse({
			success: true,
		});
	},
);

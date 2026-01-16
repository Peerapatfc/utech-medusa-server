import { StepResponse, createStep } from '@medusajs/framework/workflows-sdk';

const SUGGESTION_MULTIPLIER = {
	productViewCount: 1,
	wishlistCount: 2,
	paidCount: 3,
};

export const summaryScoreStep = createStep(
	'summary-score-step',
	async (
		input: {
			productViewCount: { id: string; viewCount: number }[];
			wishlistCount: { id: string; wishlistCount: number }[];
			paidCount: { id: string; paidCount: number }[];
		},
		_,
	) => {
		const { productViewCount, wishlistCount, paidCount } = input;

		const summaryScore = productViewCount.map((product) => {
			const viewScore =
				product.viewCount * SUGGESTION_MULTIPLIER.productViewCount;

			const wishlistScore =
				(wishlistCount.find((w) => w.id === product.id)?.wishlistCount || 0) *
				SUGGESTION_MULTIPLIER.wishlistCount;

			const paidScore =
				(paidCount.find((p) => p.id === product.id)?.paidCount || 0) *
				SUGGESTION_MULTIPLIER.paidCount;

			return {
				id: product.id,
				score: viewScore + wishlistScore + paidScore,
			};
		});

		return new StepResponse({
			summaryScore,
		});
	},
);

import { createStep, StepResponse } from '@medusajs/framework/workflows-sdk';
import type {
	AttributeFilterForm,
	CategoryFilterForm,
	ProductFilterForm,
} from '../type';

interface BuildFinalInput {
	categoryFilter: CategoryFilterForm;
	attributeFilter: AttributeFilterForm[];
	priceFilter: {
		maxPrice: number;
		minPrice: number;
	};
}

const buildFinalStep = createStep(
	'build-final-step',
	async (input: BuildFinalInput, _context) => {
		const mappedFilterConfig: ProductFilterForm[] = [];

		mappedFilterConfig.push({
			title: 'Show available only',
			attribute: 'show_available_only',
			filter_mode: 'toggle',
		});

		// Add category filter
		if (input.categoryFilter?.options?.length > 0) {
			mappedFilterConfig.push(input.categoryFilter);
		}

		// Add price filter if available
		if (input.priceFilter?.maxPrice > 0) {
			mappedFilterConfig.push({
				title: 'Price',
				attribute: 'price',
				filter_mode: 'range',
				range: {
					min: input.priceFilter.minPrice,
					max: input.priceFilter.maxPrice,
				},
			});
		}

		// Add attribute filters
		if (input.attributeFilter && input.attributeFilter.length > 0) {
			mappedFilterConfig.push(...input.attributeFilter);
		}

		return new StepResponse({
			mappedFilterConfig,
		});
	},
);

export default buildFinalStep;

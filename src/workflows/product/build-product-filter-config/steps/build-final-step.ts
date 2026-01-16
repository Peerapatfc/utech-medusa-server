import { createStep, StepResponse } from '@medusajs/framework/workflows-sdk';
import type { ProductFilterForm, ProductFilterFormOption } from '../index';

const buildFinalStep = createStep(
	'build-final-step',
	async (
		input: {
			categories: ProductFilterFormOption[];
			attributes: ProductFilterForm[];
			price: number;
		},
		_context,
	) => {
		const mappedFilterConfig: ProductFilterForm[] = [
			{
				title: 'Category',
				attribute: '_category',
				filter_mode: 'checkbox',
				options: input.categories,
			},
			{
				title: 'Price',
				attribute: 'price',
				filter_mode: 'range',
				range: {
					min: 0,
					max: input.price,
				},
			},
			...input.attributes,
		];

		return new StepResponse(
			{
				mappedFilterConfig,
			},
			{
				previousData: {},
			},
		);
	},
);

export default buildFinalStep;

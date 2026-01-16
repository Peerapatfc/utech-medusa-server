import { ContainerRegistrationKeys } from '@medusajs/framework/utils';
import { StepResponse, createStep } from '@medusajs/framework/workflows-sdk';

export interface ProductData {
	id: string;
	title: string;
	metadata?: {
		view?: number | string;
	};
}

type FetchInitialProductDataStepProps = {
	product_ids?: string[];
};

export const fetchInitialProductDataStep = createStep(
	'fetch-initial-product-data-step',
	async (
		input: FetchInitialProductDataStepProps,
		{ container },
	): Promise<StepResponse<ProductData[]>> => {
		const { product_ids = [] } = input;
		const query = container.resolve(ContainerRegistrationKeys.QUERY);

		const { data: productsFromDb } = await query.graph({
			entity: 'product',
			fields: ['id', 'title', 'metadata.view'],
			pagination: {
				take: 9999,
			},
			filters:
				product_ids.length > 0
					? {
							id: {
								$nin: product_ids,
							},
						}
					: {},
		});

		const products: ProductData[] = productsFromDb as ProductData[];

		return new StepResponse(products);
	},
);

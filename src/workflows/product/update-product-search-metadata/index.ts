import {
	createWorkflow,
	transform,
	WorkflowResponse,
} from '@medusajs/framework/workflows-sdk';
import getCalculatePriceAndQuantityWorkflow from '../get-calculated-price-and-quantity';
import updateProductSearchMetadataStep from './steps/update-product-search-metadata-step';

export type WorkflowInput = {
	productId: string[];
};

const updateProductSearchMetadataWorkflow = createWorkflow(
	'update-product-search-metadata-workflow',
	({ productId }: WorkflowInput) => {
		const productsResp = getCalculatePriceAndQuantityWorkflow.runAsStep({
			input: {
				productId,
			},
		});

		const products = transform(productsResp, (data) => {
			return data.products;
		});
		updateProductSearchMetadataStep({
			products,
		});

		return new WorkflowResponse({});
	},
);

export default updateProductSearchMetadataWorkflow;

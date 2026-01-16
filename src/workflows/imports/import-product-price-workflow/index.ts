import {
	createWorkflow,
	transform,
	when,
	WorkflowResponse,
} from '@medusajs/framework/workflows-sdk';
import updateBulkOriginalPricesStep from './steps/update-bulk-original-prices-step';
import type { ImportProductPriceWorkflowInput } from './type';
import { validateUpdateProducPriceStep } from './steps/validate-import-product-price-step';
import { upsertPriceListPricesStep } from './steps/upsert-price-list-prices-step';
import updateProductSearchMetadataWorkflow from '../../product/update-product-search-metadata';

const importProductPriceWorkflow = createWorkflow(
	'import-product-price-workflow',
	(input: ImportProductPriceWorkflowInput) => {
		// Step 1: Validate the input
		const validatedProductPrices = validateUpdateProducPriceStep({
			product_prices: input.product_prices,
		});

		// Step 2: Update the bulk original prices
		const updateBulkOriginalPricesResult = updateBulkOriginalPricesStep({
			product_prices: validatedProductPrices,
		});

		// Step 3: Upload the special price (price_list)
		upsertPriceListPricesStep({
			product_prices: validatedProductPrices,
			original_filename: input.original_filename,
		});

		const productIds = transform(
			{ validatedProductPrices },
			({ validatedProductPrices }) => {
				return validatedProductPrices.map(
					(productPrice) => productPrice.product_id,
				);
			},
		);

		when(productIds, (productIds) => {
			return productIds.length > 0;
		}).then(() => {
			updateProductSearchMetadataWorkflow.runAsStep({
				input: {
					productId: productIds,
				},
			});
		});

		return new WorkflowResponse({
			imported_results: updateBulkOriginalPricesResult,
		});
	},
);

export default importProductPriceWorkflow;

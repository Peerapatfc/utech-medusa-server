import {
	createWorkflow,
	WorkflowResponse,
} from '@medusajs/framework/workflows-sdk';
import syncToMeiliSearchStep from '../sync-product-to-meilisearch/steps/sync-to-meilisearch-step';
import { getProductsStep } from './steps/get-products-for-sync-step';
import { mapProductQuantityStep } from './steps/map-product-quantity-step';
import { mapProductPriceStep } from './steps/map-product-price-step';
import { mapProductAttributesStep } from './steps/map-product-attributes-step';
import { mapCategoriesStep } from './steps/map-categories-step';
import { mapOtherFieldsStep } from './steps/map-other-fields-step';
import { normalizeProductsStep } from './steps/normalize-products-step';

export type WorkflowInput = {
	productIds?: string[];
	syncAll?: boolean;
};

const syncProductMeilisearchWorkflowV2 = createWorkflow(
	'sync-product-meilisearch-workflow-v2',
	({ syncAll = false, productIds = [] }: WorkflowInput) => {
		const products = getProductsStep({ productIds, syncAll });
		const mappedQtyProducts = mapProductQuantityStep({ products });
		const mappedPriceProducts = mapProductPriceStep({
			products: mappedQtyProducts,
		});
		const mappedAttrProducts = mapProductAttributesStep({
			products: mappedPriceProducts,
		});
		const mappedCategoriesProducts = mapCategoriesStep({
			products: mappedAttrProducts,
		});

		const mappedOtherFieldsProducts = mapOtherFieldsStep({
			products: mappedCategoriesProducts,
		});

		const normalizedProducts = normalizeProductsStep({
			products: mappedOtherFieldsProducts,
		});

		//@ts-ignore
		syncToMeiliSearchStep({ products: normalizedProducts });

		return new WorkflowResponse({ products: normalizedProducts });
	},
);

export default syncProductMeilisearchWorkflowV2;

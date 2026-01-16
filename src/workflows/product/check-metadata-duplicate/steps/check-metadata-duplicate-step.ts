import { StepResponse, createStep } from '@medusajs/framework/workflows-sdk';
import type { IProductModuleService } from '@medusajs/types';
import { Modules } from '@medusajs/utils';
import type {
	CheckMetadataDuplicateWorkflowInput,
	CheckMetadataDuplicateWorkflowOutput,
} from '../index';

export type CheckMetadataDuplicateStepInput = {
	input: CheckMetadataDuplicateWorkflowInput;
};

const checkMetadataDuplicateStep = createStep(
	'check-metadata-duplicate-step',
	async (
		{ input }: CheckMetadataDuplicateStepInput,
		{ container },
	): Promise<StepResponse<CheckMetadataDuplicateWorkflowOutput>> => {
		const { metadata_key, metadata_value, current_product_id } = input;

		const productModuleService: IProductModuleService = container.resolve(
			Modules.PRODUCT,
		);

		// Fetch products with metadata
		const products = await productModuleService.listProducts(
			{},
			{
				select: ['id', 'title', 'handle'],
				relations: ['metadata'],
				take: 9999,
			},
		);

		// Check for metadata conflicts
		const conflictingProduct = products.find((product) => {
			// Skip the current product
			if (product.id === current_product_id) {
				return false;
			}

			// Check if product has the specified metadata key
			const metadata = product.metadata || {};
			const productValue = metadata[metadata_key] as string;

			if (!productValue) {
				return false;
			}

			return (
				productValue.toLowerCase().trim() ===
				metadata_value.toLowerCase().trim()
			);
		});

		return new StepResponse({
			is_duplicate: !!conflictingProduct,
			metadata_key,
			metadata_value,
			conflicting_product: conflictingProduct
				? {
						id: conflictingProduct.id,
						title: conflictingProduct.title,
						handle: conflictingProduct.handle,
						conflicting_value: conflictingProduct.metadata?.[
							metadata_key
						] as string,
					}
				: null,
		});
	},
);

export default checkMetadataDuplicateStep;

import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import type { Logger } from '@medusajs/framework/types';
import {
	updateInventoryLevelsWorkflow,
	updateProductVariantsWorkflow,
} from '@medusajs/medusa/core-flows';
import type {
	BulkUpdateVariants,
	UpdateVariant,
} from '../../../../../../types/product-variant';

export async function POST(
	req: MedusaRequest<BulkUpdateVariants>,
	res: MedusaResponse,
): Promise<void> {
	const updates = req.validatedBody.updates;
	const logger: Logger = req.scope.resolve('logger');

	try {
		const productVariants = mapProductsVariants(updates);
		await updateProductVariantsWorkflow(req.scope).run({
			input: {
				product_variants: productVariants,
			},
		});

		const inventoryLevels = mapInventoryLevels(updates);
		await updateInventoryLevelsWorkflow(req.scope).run({
			input: {
				updates: inventoryLevels,
			},
		});

		res.json({
			success: true,
			message: 'Update price and inventory levels successfully',
		});
	} catch (error) {
		logger.error('Error updating variants:', error.message);
		res.status(500).json({
			success: false,
			message: 'Error updating variants',
			error: error?.message ?? 'Unknown error',
		});
	}
}

const mapProductsVariants = (updates: UpdateVariant[]) => {
	return updates
		.filter((variant) => variant.variant_id && variant.prices)
		.map((variant) => {
			return {
				id: variant.variant_id,
				prices: variant.prices,
			};
		});
};

const mapInventoryLevels = (updates: UpdateVariant[]) => {
	return updates
		.filter(
			(variant) =>
				Array.isArray(variant.quantity) && variant.quantity.length > 0,
		)
		.flatMap((variant) => {
			return [...variant.quantity];
		});
};

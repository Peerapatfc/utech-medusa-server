import type { ProductVariantDTO } from '@medusajs/framework/types';
import { ContainerRegistrationKeys } from '@medusajs/framework/utils';
import { StepResponse, createStep } from '@medusajs/framework/workflows-sdk';

export const findInventoryAvailableStep = createStep(
	'find-available',
	async (input: { variants: ProductVariantDTO[] }, { container }) => {
		const { variants } = input;
		const query = container.resolve(ContainerRegistrationKeys.QUERY);

		const { data: variantWithInventory } = await query.graph({
			entity: 'variant',
			fields: [
				'id',
				'inventory_items.inventory_item_id',
				'inventory_items.required_quantity',
				'inventory_items.inventory.requires_shipping',
				'inventory_items.inventory.location_levels.stocked_quantity',
				'inventory_items.inventory.location_levels.reserved_quantity',
			],
			filters: {
				id: variants.map((variant) => variant.id),
			},
		});

		return new StepResponse({
			variantWithInventory,
		});
	},
);

export default findInventoryAvailableStep;

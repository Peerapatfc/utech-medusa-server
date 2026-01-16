import { createStep, StepResponse } from '@medusajs/framework/workflows-sdk';
import type { ProductDTO } from '@medusajs/framework/types';
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils';

const computeVariantInventoryQuantity = ({ variantInventoryItems }) => {
	const links = variantInventoryItems;
	const inventoryQuantities: number[] = [];

	for (const link of links) {
		const requiredQuantity = link.required_quantity;
		const availableQuantity = (link.inventory?.location_levels || []).reduce(
			(sum, level) => sum + (level?.available_quantity || 0),
			0,
		);

		// This will give us the maximum deliverable quantities for each inventory item
		const maxInventoryQuantity = Math.floor(
			availableQuantity / requiredQuantity,
		);

		inventoryQuantities.push(maxInventoryQuantity);
	}

	// Since each of these inventory items need to be available to perform an order,
	// we pick the smallest of the deliverable quantities as the total inventory quantity.
	return inventoryQuantities.length ? Math.min(...inventoryQuantities) : 0;
};

const getProductsQuantityStep = createStep(
	'get-products-quantity-step',
	async (input: { products: ProductDTO[] }, context) => {
		const { products } = input;
		const query = context.container.resolve(ContainerRegistrationKeys.QUERY);
		for await (const product of products) {
			const variantIds = product.variants.map((v) => v.id);
			const variants = product.variants;

			const { data: productVariantInventoryItems } = await query.graph({
				entity: 'product_variant_inventory_item',
				filters: {
					variant_id: {
						$in: variantIds,
					},
				},
				fields: [
					'*',
					// 'variant.*',
					// @ts-ignore
					// 'inventory.*',
					// @ts-ignore
					'inventory.location_levels.*',
				],
				pagination: {
					take: 100,
					skip: 0,
				},
			});

			const variantInventoriesMap = new Map();
			for (const productVariantInventoryItem of productVariantInventoryItems) {
				const array =
					variantInventoriesMap.get(productVariantInventoryItem.variant_id) ||
					[];
				array.push(productVariantInventoryItem);

				variantInventoriesMap.set(
					productVariantInventoryItem.variant_id,
					array,
				);
			}

			let productInventoryQuantity = 0;
			for (const variant of variants) {
				if (!variant.manage_inventory) {
					continue;
				}

				const links = variantInventoriesMap.get(variant.id) || [];
				const inventoryQuantity = computeVariantInventoryQuantity({
					variantInventoryItems: links,
				});

				// biome-ignore lint/complexity/useLiteralKeys: <explanation>
				variant['inventory_quantity'] = inventoryQuantity;
				productInventoryQuantity += inventoryQuantity;
			}

			// biome-ignore lint/complexity/useLiteralKeys: <explanation>
			product['inventory_quantity'] = productInventoryQuantity;
		}

		return new StepResponse({
			products,
		});
	},
);

export default getProductsQuantityStep;

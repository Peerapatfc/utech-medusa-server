import type {
	AuthenticatedMedusaRequest,
	MedusaNextFunction,
	MedusaResponse,
} from '@medusajs/framework/http';
import type { IInventoryService } from '@medusajs/framework/types';
import { Modules } from '@medusajs/framework/utils';
import type { AdminUpdateInventoryLocationLevelType } from '@medusajs/medusa/api/admin/inventory-items/validators';
import { updateInventoryItemsWorkflow } from '@medusajs/medusa/core-flows';

// Store information about items that became available
interface ItemAvailabilityInfo {
	inventory_level_id: string;
	inventory_item_id: string;
	before_available_qty: number;
}

// Use null as initial state
let itemBecameAvailable: ItemAvailabilityInfo | null = null;

/**
 * Middleware to check if an inventory item has become available for customers
 * who have wishlisted the associated product
 */
export const reStockNotification = async (
	req: AuthenticatedMedusaRequest<AdminUpdateInventoryLocationLevelType>,
	_res: MedusaResponse,
	next: MedusaNextFunction,
): Promise<void> => {
	try {
		const { id, location_id } = req.params;

		const inventoryService: IInventoryService = req.scope.resolve(
			Modules.INVENTORY,
		);

		// Get inventory items by ID
		const inventoryItem = await inventoryService.retrieveInventoryItem(id);

		if (!inventoryItem) {
			return next();
		}

		// Check inventory level to see if item was previously out of stock
		const inventoryItemLevel =
			await inventoryService.retrieveInventoryLevelByItemAndLocation(
				inventoryItem.id,
				location_id,
			);

		if (!inventoryItemLevel) {
			return next();
		}

		const beforeStockedQty = inventoryItemLevel.stocked_quantity;
		const beforeReservedQty = inventoryItemLevel.reserved_quantity;
		const beforeAvailableQty = beforeStockedQty - beforeReservedQty;

		itemBecameAvailable = {
			inventory_level_id: inventoryItemLevel.id,
			inventory_item_id: inventoryItem.id,
			before_available_qty: beforeAvailableQty,
		};

		await updateInventoryItemsWorkflow(req.scope).run({
			input: {
				updates: [
					{
						id: inventoryItem.id,
						metadata: {
							item_availability_info: itemBecameAvailable,
						},
					},
				],
			},
		});
	} catch (error) {
		console.error('Error processing inventory restock notification:', error);
	}

	next();
};

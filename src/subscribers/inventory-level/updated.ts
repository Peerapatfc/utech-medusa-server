import type { IInventoryService } from '@medusajs/framework/types';
import { InventoryEvents, Modules } from '@medusajs/framework/utils';
import type { Logger, SubscriberConfig } from '@medusajs/medusa';
import { updateInventoryItemsWorkflow } from '@medusajs/medusa/core-flows';
import restockNotificationInventoryWorkflow from 'src/workflows/notifications/restock-notification/inventory-workflow';

interface ItemAvailabilityInfo {
	inventory_level_id: string;
	inventory_item_id: string;
	before_available_qty: number;
}

export default async function inventoryLevelUpdatedHandler({
	event,
	container,
}) {
	const logger: Logger = container.resolve('logger');
	const inventoryService: IInventoryService = container.resolve(
		Modules.INVENTORY,
	);

	logger.info(
		`Inventory level updated event [InventoryEvents.INVENTORY_LEVEL_UPDATED], inventory level: ${event.data.id}`,
	);
	try {
		const inventoryLevelId = event.data.id;

		const inventoryLevel =
			await inventoryService.retrieveInventoryLevel(inventoryLevelId);

		const inventoryItem = await inventoryService.retrieveInventoryItem(
			inventoryLevel?.inventory_item_id,
		);

		const stockedQty = inventoryLevel.stocked_quantity;
		const reservedQty = inventoryLevel.reserved_quantity;
		const availableQty = stockedQty - reservedQty;

		const item_availability_info = inventoryItem?.metadata
			?.item_availability_info as ItemAvailabilityInfo;

		if (!item_availability_info) {
			return;
		}

		if (
			availableQty > 0 &&
			item_availability_info.before_available_qty <= 0 &&
			inventoryLevel?.inventory_item_id
		) {
			// Use the inventory-specific workflow for handling restock notifications
			await restockNotificationInventoryWorkflow(container).run({
				input: {
					inventoryItemId: inventoryLevel.inventory_item_id,
					inventoryItemSku: inventoryItem?.sku,
				},
			});

			logger.info(
				`Processed restock notifications for inventory item ${inventoryLevel?.inventory_item_id}`,
			);

			await updateInventoryItemsWorkflow(container).run({
				input: {
					updates: [
						{
							id: inventoryItem.id,
							metadata: {
								item_availability_info: undefined,
							},
						},
					],
				},
			});
		}
	} catch (error) {
		logger.error(
			`Error processing inventory availability notification: ${error.message}`,
		);
	}
}

export const config: SubscriberConfig = {
	event: InventoryEvents.INVENTORY_LEVEL_UPDATED,
	context: {
		subscriberId: 'inventory-level.updated-availability-notification',
	},
};

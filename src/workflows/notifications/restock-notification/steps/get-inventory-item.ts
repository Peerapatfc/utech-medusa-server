import type {
	IInventoryService,
	InventoryItemDTO,
	InventoryLevelDTO,
} from '@medusajs/framework/types';
import { Modules } from '@medusajs/framework/utils';
import { StepResponse, createStep } from '@medusajs/framework/workflows-sdk';

export type InventoryInput = {
	inventoryItemId: string;
	locationId: string;
};

export type InventoryItemResponse = {
	success: boolean;
	inventoryItem: InventoryItemDTO | null;
	inventoryLevel: InventoryLevelDTO | null;
	beforeAvailableQty: number;
	wasOutOfStock: boolean;
};

export const getInventoryItemStep = createStep(
	'get-inventory-item-details',
	async ({ inventoryItemId, locationId }: InventoryInput, { container }) => {
		const inventoryService: IInventoryService = container.resolve(
			Modules.INVENTORY,
		);

		// Get inventory items by ID
		const inventoryItem =
			await inventoryService.retrieveInventoryItem(inventoryItemId);

		if (!inventoryItem) {
			return new StepResponse<InventoryItemResponse>({
				success: false,
				inventoryItem: null,
				inventoryLevel: null,
				beforeAvailableQty: 0,
				wasOutOfStock: false,
			});
		}

		// Check inventory level to see if item was previously out of stock
		const inventoryItemLevel =
			await inventoryService.retrieveInventoryLevelByItemAndLocation(
				inventoryItemId,
				locationId,
			);

		if (!inventoryItemLevel) {
			return new StepResponse<InventoryItemResponse>({
				success: false,
				inventoryItem,
				inventoryLevel: null,
				beforeAvailableQty: 0,
				wasOutOfStock: false,
			});
		}

		const beforeStockedQty = inventoryItemLevel.stocked_quantity || 0;
		const beforeReservedQty = inventoryItemLevel.reserved_quantity || 0;
		const beforeAvailableQty = beforeStockedQty - beforeReservedQty;
		const wasOutOfStock = beforeAvailableQty <= 0;

		if (beforeAvailableQty > 0) {
			return new StepResponse<InventoryItemResponse>({
				success: false,
				inventoryItem,
				inventoryLevel: inventoryItemLevel,
				beforeAvailableQty,
				wasOutOfStock: true,
			});
		}

		return new StepResponse<InventoryItemResponse>({
			success: true,
			inventoryItem,
			inventoryLevel: inventoryItemLevel,
			beforeAvailableQty,
			wasOutOfStock,
		});
	},
);

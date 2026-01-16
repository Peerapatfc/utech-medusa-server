import type {
	AuthenticatedMedusaRequest,
	MedusaNextFunction,
	MedusaResponse,
} from '@medusajs/framework/http';
import type {
	HttpTypes,
	IInventoryService,
	Logger,
} from '@medusajs/framework/types';
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils';
import { ADMIN_MODULE } from '../../../modules/admin';
import type AdminModuleService from '../../../modules/admin/service';
import updateProductSearchMetadataWorkflow from '../../../workflows/product/update-product-search-metadata';

export const logBulkUpdateInventoryItem = async (
	req: AuthenticatedMedusaRequest<HttpTypes.AdminBatchInventoryItemsLocationLevels>,
	_res: MedusaResponse,
	next: MedusaNextFunction,
) => {
	const { body, auth_context } = req;
	const actor_id = auth_context?.actor_id || '';
	const inventoryService: IInventoryService = req.scope.resolve(
		Modules.INVENTORY,
	);
	const adminService: AdminModuleService = req.scope.resolve(ADMIN_MODULE);
	const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

	const logger: Logger = req.scope.resolve('logger');
	try {
		const adminLogs = [];
		const inventoryItemLogs = [];
		const inventoryItemIds = [];

		// Create inventory item levels
		for await (const inventoryItemLevelCreate of body.create) {
			const { inventory_item_id, stocked_quantity, location_id } =
				inventoryItemLevelCreate;

			inventoryItemIds.push(inventory_item_id);
			adminLogs.push({
				action: 'created',
				resource_id: inventory_item_id,
				resource_type: 'inventory_item',
				actor_id,
			});

			const inventoryItemLevel =
				await inventoryService.retrieveInventoryLevelByItemAndLocation(
					inventory_item_id,
					location_id,
				);

			if (!inventoryItemLevel) {
				continue;
			}

			const available_quantity =
				stocked_quantity - inventoryItemLevel.reserved_quantity;

			inventoryItemLogs.push({
				action: 'created',
				from_quantity: 0,
				to_quantity: stocked_quantity,
				inventory_item_id,
				inventory_level_id: inventoryItemLevel.id,
				actor_id,
				metadata: {
					current_reserved_quantity: inventoryItemLevel.reserved_quantity,
					available_quantity,
				},
			});
		}

		// Update inventory item levels
		for await (const inventoryItemLevelUpdate of body.update) {
			const { inventory_item_id, stocked_quantity, location_id } =
				inventoryItemLevelUpdate;
			inventoryItemIds.push(inventory_item_id);

			const inventoryItemLevel =
				await inventoryService.retrieveInventoryLevelByItemAndLocation(
					inventory_item_id,
					location_id,
				);
			if (!inventoryItemLevel) {
				continue;
			}

			const available_quantity =
				stocked_quantity - inventoryItemLevel.reserved_quantity;

			adminLogs.push({
				action: 'updated',
				resource_id: inventory_item_id,
				resource_type: 'inventory_item',
				actor_id,
			});

			inventoryItemLogs.push({
				action: 'updated',
				from_quantity: inventoryItemLevel.stocked_quantity,
				to_quantity: stocked_quantity,
				inventory_item_id,
				inventory_level_id: inventoryItemLevel.id,
				actor_id,
				metadata: {
					current_reserved_quantity: inventoryItemLevel.reserved_quantity,
					available_quantity,
				},
			});
		}

		adminService.createInventoryItemLogs(inventoryItemLogs);
		adminService.createAdminLogs(adminLogs);

		// update product search metadata
		const productIds = [];
		for await (const inventoryItemId of inventoryItemIds) {
			const {
				data: [inventoryItem],
			} = await query.graph({
				entity: 'inventory_item',
				filters: { id: inventoryItemId },
				fields: ['variants.product_id'],
			});

			if (
				!inventoryItem ||
				!inventoryItem.variants ||
				!inventoryItem.variants.length
			) {
				continue;
			}

			productIds.push(inventoryItem.variants[0].product_id);
		}

		if (productIds.length) {
			// timeout 10 seconds to perform the update
			setTimeout(() => {
				updateProductSearchMetadataWorkflow(req.scope).run({
					input: {
						productId: productIds,
					},
				});
			}, 10000);
		}

		next();
	} catch (error) {
		logger.error(`Error logging inventory item bulk: ${error?.message}`);
		next();
	}
};

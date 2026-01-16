import type {
	AuthenticatedMedusaRequest,
	MedusaNextFunction,
	MedusaResponse,
} from '@medusajs/framework/http';
import type { IInventoryService, Logger } from '@medusajs/framework/types';
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils';
import type { AdminUpdateInventoryLocationLevelType } from '@medusajs/medusa/api/admin/inventory-items/validators';
import { ADMIN_MODULE } from '../../../modules/admin';
import type AdminModuleService from '../../../modules/admin/service';
import updateProductSearchMetadataWorkflow from '../../../workflows/product/update-product-search-metadata';

export const logUpdateInventoryItem = async (
	req: AuthenticatedMedusaRequest<AdminUpdateInventoryLocationLevelType>,
	_res: MedusaResponse,
	next: MedusaNextFunction,
) => {
	const { body, auth_context } = req;
	const actor_id = auth_context?.actor_id || '';
	const { id, location_id } = req.params;
	const inventoryService: IInventoryService = req.scope.resolve(
		Modules.INVENTORY,
	);

	const logger: Logger = req.scope.resolve('logger');
	try {
		const inventoryItemLevel =
			await inventoryService.retrieveInventoryLevelByItemAndLocation(
				id,
				location_id,
			);
		if (!inventoryItemLevel) {
			next();
		}

		const available_quantity =
			body.stocked_quantity - inventoryItemLevel.reserved_quantity;

		const adminService: AdminModuleService = req.scope.resolve(ADMIN_MODULE);
		adminService.createInventoryItemLogs({
			action: 'updated',
			from_quantity: inventoryItemLevel.stocked_quantity,
			to_quantity: body.stocked_quantity,
			inventory_item_id: id,
			inventory_level_id: inventoryItemLevel.id,
			actor_id,
			metadata: {
				current_reserved_quantity: inventoryItemLevel.reserved_quantity,
				available_quantity,
			},
		});

		adminService.createAdminLogs({
			action: 'updated',
			resource_id: id,
			resource_type: 'inventory_item',
			actor_id,
		});

		//TODO: update product search metadata
		const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
		const {
			data: [inventoryItem],
		} = await query.graph({
			entity: 'inventory_item',
			filters: { id },
			fields: ['variants.product_id'],
		});
		const productId = inventoryItem.variants?.[0]?.product_id;
		if (productId) {
			updateProductSearchMetadataWorkflow(req.scope).run({
				input: {
					productId: [productId],
				},
			});
		}

		next();
	} catch (error) {
		logger.error(`Error logging inventory item update: ${error?.message}`);
		next();
	}
};

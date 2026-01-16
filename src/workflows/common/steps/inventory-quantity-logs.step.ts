import { createStep, StepResponse } from '@medusajs/framework/workflows-sdk';
import type { Logger, OrderDetailDTO } from '@medusajs/framework/types';
import { ContainerRegistrationKeys } from '@medusajs/framework/utils';
import type AdminModuleService from '../../../modules/admin/service';
import { ADMIN_MODULE } from '../../../modules/admin';

interface StepInput {
	orderDetail: OrderDetailDTO;
	action: 'reserved' | 'returned';
}

const inventoryQuantityLogsStep = createStep(
	'inventory-quantity-logs-step',
	async ({ orderDetail, action }: StepInput, { container }) => {
		const logger: Logger = container.resolve('logger');

		const items = orderDetail.items || [];
		const adminService: AdminModuleService = container.resolve(ADMIN_MODULE);
		const query = container.resolve(ContainerRegistrationKeys.QUERY);
		try {
			for await (const item of items) {
				const { quantity } = item;

				let reservationItem = null;
				const {
					data: [aliveReservationItem],
				} = await query.graph({
					entity: 'reservation_item',
					filters: {
						line_item_id: item.id,
					},
					fields: ['*', 'inventory_item.*', 'inventory_item.location_levels.*'],
					pagination: { take: 1, skip: 0 },
				});

				reservationItem = aliveReservationItem;
				if (!aliveReservationItem) {
					const {
						data: [deletedReservationItem],
					} = await query.graph({
						entity: 'reservation_item',
						filters: {
							line_item_id: item.id,
							deleted_at: { $ne: null },
						},
						fields: [
							'*',
							'inventory_item.*',
							'inventory_item.location_levels.*',
						],
						pagination: { take: 1, skip: 0 },
					});
					reservationItem = deletedReservationItem;
				}

				const { inventory_item } = reservationItem;

				const available_quantity =
					//@ts-ignore
					inventory_item?.location_levels[0]?.available_quantity;

				const metadata = {
					order_id: orderDetail.id,
					available_quantity,
					reserved_quantity: undefined,
					returned_quantity: undefined,
				};
				switch (action) {
					case 'reserved':
						metadata.reserved_quantity = quantity;
						break;
					case 'returned':
						metadata.returned_quantity = quantity;
						break;
				}

				adminService.createInventoryItemLogs({
					action,
					from_quantity: null,
					to_quantity:
						reservationItem.inventory_item?.location_levels[0]
							?.stocked_quantity,
					inventory_item_id: reservationItem.inventory_item_id,
					inventory_level_id:
						reservationItem.inventory_item?.location_levels[0]?.id,
					actor_id: 'system',
					metadata,
				});
			}
		} catch (error) {
			logger.error(`Error in inventoryLogsStep: ${error.message}`);
		}

		return new StepResponse({});
	},
);

export default inventoryQuantityLogsStep;

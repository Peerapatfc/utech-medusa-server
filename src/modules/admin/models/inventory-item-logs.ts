import { model } from '@medusajs/framework/utils';

export const InventoryItemLog = model.define('inventory_item_logs', {
	id: model.id({ prefix: 'ii-log' }).primaryKey(),
	action: model.enum(['updated', 'reserved', 'returned']),
	from_quantity: model.number().default(0).nullable(),
	to_quantity: model.number().default(0).nullable(),
	inventory_item_id: model.text(),
	inventory_level_id: model.text().nullable(),
	actor_id: model.text().nullable(),
	metadata: model.json().nullable(),
});

export default InventoryItemLog;

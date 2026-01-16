import type { MedusaRequest, MedusaResponse } from '@medusajs/framework';
import type { IUserModuleService } from '@medusajs/framework/types';
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils';

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
	const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
	const id = req.params.id;
	const limit = req.query.limit
		? Number.parseInt(req.query.limit as string)
		: 10;

	const offset = req.query.offset
		? Number.parseInt(req.query.offset as string)
		: 0;

	const { data: inventoryItemLogs, metadata } = await query.graph({
		entity: 'inventory_item_logs',
		fields: ['*'],
		filters: {
			inventory_item_id: id,
		},
		pagination: {
			skip: offset,
			take: limit,
			order: {
				created_at: 'desc',
			},
		},
	});

	const userService: IUserModuleService = req.scope.resolve(Modules.USER);
	for await (const inventoryItemLog of inventoryItemLogs) {
		const admin = await userService
			.retrieveUser(inventoryItemLog.actor_id)
			.catch(() => null);

		// biome-ignore lint/complexity/useLiteralKeys: <explanation>
		inventoryItemLog['actor_name'] = admin
			? `${admin.first_name} ${admin.last_name}`
			: inventoryItemLog.actor_id;
	}

	res.status(200).json({
		inventory_item_logs: inventoryItemLogs,
		count: metadata.count,
		limit,
		offset,
	});
};

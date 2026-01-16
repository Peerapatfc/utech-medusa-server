import type { MedusaRequest, MedusaResponse } from '@medusajs/framework';
import type { IOrderModuleService, Logger } from '@medusajs/framework/types';
import { Modules } from '@medusajs/framework/utils';

interface ItemDto {
	id: string;
	serial_number: string;
}

export const POST = async (
	req: MedusaRequest<{ items: ItemDto[] }>,
	res: MedusaResponse,
) => {
	const logger: Logger = req.scope.resolve('logger');
	const orderId = req.params.id;
	const orderService: IOrderModuleService = req.scope.resolve(Modules.ORDER);
	const { items } = req.body;
	if (!items || items.length === 0) {
		res.status(400).json({ message: 'No items provided' });
		return;
	}

	for await (const item of items) {
		await orderService.updateOrderLineItems(item.id, {
			metadata: {
				serial_number: item.serial_number || '',
			},
		});

		logger.info(`Updated serial number for item ${item.id}, order ${orderId}`);
	}

	res.status(200).json({ message: 'Success' });
};

import type { MedusaRequest, MedusaResponse } from '@medusajs/framework';
import type { IOrderModuleService } from '@medusajs/framework/types';
import { Modules } from '@medusajs/framework/utils';

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
	const { id: orderId } = req.params;
	const orderService: IOrderModuleService = req.scope.resolve(Modules.ORDER);

	const order = await orderService.retrieveOrder(orderId);
	const tax_invoice_address_id = order.metadata
		?.tax_invoice_address_id as string;
	if (!order || !tax_invoice_address_id) {
		res.status(200).json({
			tax_invoice_address: null,
		});
		return;
	}

	const orderAddress = await orderService
		.listOrderAddresses(
			{
				id: tax_invoice_address_id,
			},
			{
				take: 1,
				skip: 0,
			},
		)
		.then((addresses) => addresses[0]);

	res.status(200).json({
		tax_invoice_address: orderAddress || null,
	});
};

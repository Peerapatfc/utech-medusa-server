import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { PRE_ORDER_SERVICE } from '../../../../../../../modules/pre-order';
import type PreOrderService from '../../../../../../../modules/pre-order/service';

export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
	const templateId = req.params.id;
	const productId = req.params.product_id;
	const preOrderService: PreOrderService = req.scope.resolve(PRE_ORDER_SERVICE);

	const preOrderItems = await preOrderService.listPreOrderTemplateItems({
		pre_order_template_id: templateId,
		product_id: productId,
	});

	const preOrderItemIds = preOrderItems.map((item) => item.id);
	await preOrderService.softDeletePreOrderTemplateItems(preOrderItemIds);
	await preOrderService.softDeletePreOrderItemPickupOptions({
		pre_order_item_id: preOrderItemIds,
	});

	res.status(200).json({
		success: true,
	});
};

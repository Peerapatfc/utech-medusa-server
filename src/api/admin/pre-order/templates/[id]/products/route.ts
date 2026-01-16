import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import type PreOrderService from '../../../../../../modules/pre-order/service';
import { PRE_ORDER_SERVICE } from '../../../../../../modules/pre-order';

interface IAddProductsToPreOrder {
	product_ids: string[];
}

export const POST = async (
	req: MedusaRequest<IAddProductsToPreOrder>,
	res: MedusaResponse,
) => {
	const id = req.params.id;
	const productIds = req.body.product_ids;
	const preOrderService: PreOrderService = req.scope.resolve(PRE_ORDER_SERVICE);
	const pickupOptions = await preOrderService.listPickupOptions({});
	const preOrderTemplate = await preOrderService.retrievePreOrderTemplate(id);

	const createdItemIds = [];
	for await (const productId of productIds) {
		const existItem = await preOrderService
			.listPreOrderTemplateItems(
				{
					pre_order_template_id: id,
					product_id: productId,
				},
				{ take: 1 },
			)
			.then((items) => items[0]);
		if (existItem) continue;

		const item = await preOrderService.createPreOrderTemplateItems({
			pre_order_template_id: id,
			product_id: productId,
		});

		createdItemIds.push(item.id);
	}

	for await (const createdItemId of createdItemIds) {
		for await (const pickupOption of pickupOptions) {
			await preOrderService.createPreOrderItemPickupOptions({
				option_slug: pickupOption.slug,
				name_th: pickupOption.name_th,
				name_en: pickupOption.name_en,
				is_upfront_payment: pickupOption.is_upfront_payment,
				is_overide_unit_price: pickupOption.is_overide_unit_price,
				is_enabled_shipping: pickupOption.is_enabled_shipping,
				upfront_price: preOrderTemplate.upfront_price,
				shipping_start_date: preOrderTemplate.shipping_start_date,
				pickup_start_date: preOrderTemplate.pickup_start_date,
				rank: pickupOption.rank,
				pre_order_item_id: createdItemId,
			});
		}
	}

	res.status(200).json({
		success: true,
	});
};

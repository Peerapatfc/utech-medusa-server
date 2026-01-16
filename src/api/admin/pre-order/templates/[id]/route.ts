import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { PRE_ORDER_SERVICE } from '../../../../../modules/pre-order';
import type PreOrderService from '../../../../../modules/pre-order/service';
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils';
import type { IEventBusModuleService } from '@medusajs/framework/types';

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
	const id = req.params.id;
	const preOrderService: PreOrderService = req.scope.resolve(PRE_ORDER_SERVICE);

	const preOrderTemplate = await preOrderService.retrievePreOrderTemplate(id);
	const proOrderItems = await preOrderService.listPreOrderTemplateItems({
		pre_order_template_id: id,
	});
	const productIds = proOrderItems.map((item) => item.product_id);

	const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
	const { data: products } = await query.graph({
		entity: 'product',
		fields: ['*', 'variants.*'],
		filters: {
			id: {
				$in: productIds,
			},
		},
		pagination: {
			take: 1000,
			skip: 0,
		},
	});

	res.status(200).json({
		pre_order_template: preOrderTemplate,
		products,
	});
};

export const POST = async (
	req: MedusaRequest<{
		shipping_start_date?: Date;
		pickup_start_date?: Date;
		upfront_price?: number;
	}>,
	res: MedusaResponse,
) => {
	const id = req.params.id;
	const preOrderService: PreOrderService = req.scope.resolve(PRE_ORDER_SERVICE);
	const eventBus: IEventBusModuleService = req.scope.resolve(Modules.EVENT_BUS);
	const payload = req.body;

	const updated = await preOrderService.updatePreOrderTemplates({
		id,
		...payload,
	});

	if (updated) {
		eventBus.emit({
			name: 'pre_order_template.updated',
			data: {
				...updated,
			},
		});
	}

	res.status(200).json({
		success: true,
		pre_order_template: updated,
	});
};

export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
	const id = req.params.id;
	const preOrderService: PreOrderService = req.scope.resolve(PRE_ORDER_SERVICE);
	await preOrderService.softDeletePreOrderTemplates(id);

	const preOrderItems = await preOrderService.listPreOrderTemplateItems({
		pre_order_template_id: id,
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

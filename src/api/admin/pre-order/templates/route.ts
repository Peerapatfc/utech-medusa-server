import type { MedusaRequest, MedusaResponse } from '@medusajs/framework';
import { PRE_ORDER_SERVICE } from '../../../../modules/pre-order';
import type PreOrderService from '../../../../modules/pre-order/service';
import type { CreatePreOrderTemplateDTO } from './type';
import type { IEventBusModuleService } from '@medusajs/framework/types';
import { Modules } from '@medusajs/framework/utils';

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
	const preOrderService: PreOrderService = req.scope.resolve(PRE_ORDER_SERVICE);
	const [preOrderTemplates, count] =
		await preOrderService.listAndCountPreOrderTemplates(
			{},
			{
				order: { created_at: 'desc' },
			},
		);

	res.status(200).json({
		success: true,
		count,
		pre_order_templates: preOrderTemplates,
	});
};

export const POST = async (
	req: MedusaRequest<CreatePreOrderTemplateDTO>,
	res: MedusaResponse,
) => {
	const preOrderService: PreOrderService = req.scope.resolve(PRE_ORDER_SERVICE);
	const eventBus: IEventBusModuleService = req.scope.resolve(Modules.EVENT_BUS);
	const body = req.body;

	const preOrderTemplate = await preOrderService.createPreOrderTemplates({
		...body,
	});

	if (preOrderTemplate) {
		eventBus.emit({
			name: 'pre_order_template.created',
			data: {
				...preOrderTemplate,
			},
		});
	}

	res.status(201).json({
		...preOrderTemplate,
	});
};

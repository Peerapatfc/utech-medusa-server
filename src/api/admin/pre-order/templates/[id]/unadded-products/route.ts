import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils';
import type PreOrderService from '../../../../../../modules/pre-order/service';
import { PRE_ORDER_SERVICE } from '../../../../../../modules/pre-order';

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
	const id = req.params.id;
	const preOrderService: PreOrderService = req.scope.resolve(PRE_ORDER_SERVICE);
	const productsService = req.scope.resolve(Modules.PRODUCT);
	const preOrderProductType = await productsService
		.listProductTypes({
			value: 'Pre-order',
		})
		.then((types) => types[0]);

	const proOrderItems = await preOrderService.listPreOrderTemplateItems({
		// pre_order_template_id: id,
	});
	const productIds = proOrderItems.map((item) => item.product_id);

	const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
	const { data: products } = await query.graph({
		entity: 'product',
		fields: ['*', 'variants.*'],
		filters: {
			id: {
				$nin: productIds,
			},
			type_id: preOrderProductType.id,
		},
		pagination: {
			take: 1000,
			skip: 0,
		},
	});

	res.status(200).json({
		products,
		count: products.length,
	});
};

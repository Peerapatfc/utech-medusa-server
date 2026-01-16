import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import myWorkflow from '../../../workflows/my-workflow';
import syncProductMeilisearchWorkflowV2 from '../../../workflows/product/sync-meilisearch-v2';
import { syncProductsWorkflow } from '../../../workflows/product/sync-products';
// import { Modules } from '@medusajs/framework/utils';
// import { Redis } from 'ioredis';
// import { v4 as uuidv4 } from 'uuid';
// import orderCanceledWorkflow from '../../../workflows/order/order-canceled-wrokflow';

export async function GET(req: MedusaRequest, res: MedusaResponse) {
	// const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

	// await orderPlacedWorkflow(req.scope).run({
	// 	input: {
	// 		id: 'order_01JKF9229711318HKY8F2764QP',
	// 	},
	// });

	// await orderCanceledWorkflow(req.scope).run({
	// 	input: {
	// 		id: 'order_01JQNJCMPV9EM3FTB6N6ABQTT4',
	// 	},
	// });

	// const { result } = await syncProductMeilisearchWorkflowV2(req.scope).run({
	// 	input: {
	// 		syncAll: true,
	// 		// productIds: ['prod_01JZVVRTK4HZ7CTW81RDCTZTTN'],
	// 	},
	// });

	res.status(200).json({
		message: 'ok',
	});
}

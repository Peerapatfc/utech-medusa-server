import type {
	AuthenticatedMedusaRequest,
	MedusaResponse,
} from '@medusajs/framework';
import type { AdminOrder } from '@medusajs/framework/types';
import { getOrdersListWorkflow } from '@medusajs/medusa/core-flows';
import { trackingOrderFields } from '../../../../../utils/query-configs/order';
import getFulfillmentTrackingWorkflow from '../../../../..//workflows/fulfillment-tracking/get-fulfillment-tracking-workflow';

interface CustomOrder extends AdminOrder {
	is_order_owner?: boolean;
}

export const GET = async (
	req: AuthenticatedMedusaRequest,
	res: MedusaResponse,
) => {
	const { q } = req.query;
	const customer_id = req.auth_context?.actor_id;
	if (!q || typeof q !== 'string' || q.length > 50) {
		res.status(400).json({
			message: 'Invalid query parameter',
		});
		return;
	}

	const workflow = getOrdersListWorkflow(req.scope);
	const { result: orders } = (await workflow.run({
		input: {
			fields: trackingOrderFields,
			variables: {
				filters: {
					$or: [
						{
							id: q,
						},
						// {
						// 	display_id: q,
						// },
						{
							metadata: {
								order_no: q,
							},
						},
						{
							shipping_address: {
								phone: q,
							},
						},
					],
				},
				order: {
					created_at: 'desc',
				},
			},
		},
	})) as unknown as { result: CustomOrder[] };

	const paidStatuses = ['captured', 'refunded', 'partially_refunded'];
	const capturedOrders = orders.filter((order) =>
		paidStatuses.includes(order.payment_status),
	);

	for (const order of capturedOrders) {
		order.metadata = {
			order_no: order.metadata?.order_no || '',
			payment_expiration: order.metadata?.payment_expiration || null,
		};
		order.items = undefined;
		order.shipping_address = undefined;
		order.is_order_owner = order.customer_id === customer_id;

		// if (!order.is_order_owner && order.fulfillments) {
		// 	order.fulfillments = order.fulfillments.map((fulfillment) => ({
		// 		...fulfillment,
		// 		labels: undefined,
		// 	}));
		// }

		const shouldShowTracking =
			customer_id &&
			order.is_order_owner &&
			(order.fulfillment_status === 'shipped' ||
				order.fulfillment_status === 'delivered');

				console.log(customer_id,'customer_id')

		//if (shouldShowTracking) {
			const { result: fulfillmentTracking } =
				await getFulfillmentTrackingWorkflow(req.scope).run({
					input: {
						order_id: order.id,
						customer_id,
					},
				});

			if (fulfillmentTracking?.trackings) {
				order.fulfillments = order.fulfillments.map((fulfillment) => {
					const trackingData =
						fulfillmentTracking.trackings?.fulfillments?.[0]?.labels?.[0]
							?.fulfillment_tracking;

					return {
						...fulfillment,
						tracking_events: trackingData?.tracking_events || [],
						current_status: trackingData?.current_status || '',
						updated_at: trackingData?.updated_at || null,
					};
				});
			}
		//}
	}

	res.status(200).json(capturedOrders);
};

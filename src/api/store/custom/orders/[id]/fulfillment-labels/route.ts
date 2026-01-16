import {
	AuthenticatedMedusaRequest,
	MedusaResponse,
} from '@medusajs/framework';
import { ContainerRegistrationKeys } from '@medusajs/framework/utils';
import getFulfillmentTrackingWorkflow from '../../../../../../workflows/fulfillment-tracking/get-fulfillment-tracking-workflow';

export const GET = async (
	req: AuthenticatedMedusaRequest,
	res: MedusaResponse,
) => {
	const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
	const id = req.params.id;
	const customer_id = req.auth_context.actor_id;

	const { data: orders } = await query.graph({
		entity: 'order',
		filters: { id },
		fields: ['fulfillments.labels.*'],
	});

	const order = orders[0];
	if (!order) {
		return res.status(404).json({ message: 'Order not found' });
	}
	const fulfillmentLabels = order.fulfillments?.flatMap((f) => f.labels) || [];

	const trackingEvents = [];
	try {
		const { result: fulfillmentTracking } =
			await getFulfillmentTrackingWorkflow(req.scope).run({
				input: {
					order_id: id,
					customer_id,
				},
			});

		const trackingData =
			fulfillmentTracking?.trackings?.fulfillments?.[0]?.labels?.[0]
				?.fulfillment_tracking;
		trackingEvents.push(...(trackingData?.tracking_events || []));
	} catch (error) {
		console.error('Error fetching fulfillment tracking:', error);
	}

	res.json({
		fulfillment_labels: fulfillmentLabels,
		tracking_events: trackingEvents,
	});
};

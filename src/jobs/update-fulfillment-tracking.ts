import type { MedusaContainer } from '@medusajs/framework/types';
import {
	ContainerRegistrationKeys,
	OrderStatus,
} from '@medusajs/framework/utils';
import upsertFulfillmentTrackingWorkflow from '../workflows/fulfillment-tracking/upsert-fulfillment-tracking-workflow';

interface FulfillmentLabel {
	tracking_number: string;
	fulfillment_tracking: {
		current_status: string;
	};
}

export default async function handlerUpdateFulfillmentTracking(
	container: MedusaContainer,
) {
	const logger = container.resolve('logger');

	if (process.env.NODE_ENV === 'development') {
		logger.info(
			'[cron]: Update fulfillment tracking worker is disabled in development mode',
		);
		return;
	}

	try {
		// Get orders that are pending and have fulfillments

		const query = container.resolve(ContainerRegistrationKeys.QUERY);

		const { data: orders } = await query.graph({
			entity: 'order',
			fields: [
				'id',
				'fulfillments.*',
				'fulfillments.labels.id',
				'fulfillments.labels.tracking_number',
				'fulfillments.labels.fulfillment_tracking.id',
				'fulfillments.labels.fulfillment_tracking.current_status',
				'fulfillments.labels.fulfillment_tracking.tracking_events',
				'fulfillments.labels.fulfillment_tracking.updated_at',
			],
			filters: {
				status: {
					$in: [OrderStatus.PENDING],
				},

				canceled_at: null,
			},
			pagination: {
				take: 1000,
				order: {
					created_at: 'DESC',
				},
			},
		});

		if (!orders || orders.length === 0) {
			logger.info('[cron]: No orders found with fulfillments to update');
			return;
		}

		const orderShippedWithTracking = orders.filter((order) =>
			order.fulfillments?.some((fulfillment) =>
				fulfillment.labels?.some(
					(label) =>
						label.tracking_number &&
						(label as unknown as FulfillmentLabel).fulfillment_tracking
							?.current_status !== 'Sign',
				),
			),
		);

		if (orderShippedWithTracking.length === 0) {
			logger.info('[cron]: No orders found with tracking numbers');
			return;
		}

		logger.info(
			`[cron]: Found ${orderShippedWithTracking.length} orders with tracking numbers to update`,
		);

		let successCount = 0;
		let errorCount = 0;

		// Process each order
		for (const order of orderShippedWithTracking) {
			try {
				await upsertFulfillmentTrackingWorkflow(container).run({
					input: {
						order_id: order.id,
					},
				});

				successCount++;
				logger.info(`[cron]: Updated tracking for order ${order.id}`);
			} catch (error) {
				errorCount++;
				logger.error(
					`[cron]: Failed to update tracking for order ${order.id}:`,
					error,
				);
			}
		}

		logger.info(
			`[cron]: Update fulfillment tracking completed - Success: ${successCount}, Errors: ${errorCount}`,
		);
	} catch (error) {
		logger.error('[cron]: Update fulfillment tracking worker failed:', error);
	}

	logger.info('[cron]: Update fulfillment tracking worker has finished');
}

export const config = {
	name: 'update-fulfillment-tracking',
	schedule: '0 */1 * * *',
};

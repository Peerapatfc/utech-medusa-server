import { createStep, StepResponse } from '@medusajs/framework/workflows-sdk';
import type { Logger } from '@medusajs/framework/types';
import type {
	TraceDetail,
	TrackingEvent,
	ProcessTrackingDataInput,
} from '../../../types/fulfillment-tracking';

const processTrackingDataStep = createStep(
	'process-tracking-data-step',
	async (input: ProcessTrackingDataInput, { container }) => {
		const { order_data, express_info } = input;
		const logger: Logger = container.resolve('logger');

		try {
			if (!order_data?.data?.[0]) {
				return new StepResponse(null);
			}

			const order_with_tracking = { ...order_data.data[0] };

			// Process express info if available
			const express_list = express_info?.data?.expressList;
			if (express_list?.length > 0) {
				const express_item = express_list[0];

				// Map tracking events to only include required properties
				const tracking_events: TrackingEvent[] = (
					express_item.traceDetails || []
				).map((detail: TraceDetail) => ({
					seq_num: detail.seqNum,
					remark: detail.remark,
					accept_time: new Date(detail.acceptTime).toISOString(),
				}));

				const current_status = express_item.currentScanType || '';

				// Calculate updated_at from the latest acceptTime
				const latest_accept_time =
					tracking_events.length > 0
						? Math.max(
								...tracking_events.map((event) =>
									new Date(event.accept_time).getTime(),
								),
							)
						: Date.now();
				const updated_at = new Date(latest_accept_time).toISOString();

				// Update the tracking data in the order
				const label = order_with_tracking.fulfillments?.[0]?.labels?.[0];
				if (label) {
					label.fulfillment_tracking = {
						id: label.fulfillment_tracking?.id || label.id,
						tracking_events: tracking_events,
						current_status: current_status,
						updated_at: updated_at,
					};
				}
			}

			return new StepResponse(order_with_tracking);
		} catch (error) {
			logger.error('Failed to process tracking data:', error);
			throw error;
		}
	},
);

export default processTrackingDataStep;

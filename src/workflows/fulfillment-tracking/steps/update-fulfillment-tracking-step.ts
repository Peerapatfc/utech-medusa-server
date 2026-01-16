import { createStep, StepResponse } from '@medusajs/framework/workflows-sdk';
import type { Logger } from '@medusajs/framework/types';
import type FulfillmentTrackingService from '../../../modules/fulfillment-tracking/service';
import { FULFILLMENT_TRACKING_MODULE } from '../../../modules/fulfillment-tracking';
import type {
	TraceDetail,
	TrackingEvent,
	UpdateFulfillmentTrackingInput,
} from '../../../types/fulfillment-tracking';

const updateFulfillmentTrackingStep = createStep(
	'update-fulfillment-tracking-step',
	async (input: UpdateFulfillmentTrackingInput, { container }) => {
		const {
			tracking_events,
			current_status,
			fulfillment_tracking_id,
			order_data,
			express_info,
		} = input;
		const logger: Logger = container.resolve('logger');
		const fulfillmentTrackingService: FulfillmentTrackingService =
			container.resolve(FULFILLMENT_TRACKING_MODULE);

		try {
			// Get the existing fulfillment tracking ID
			let existing_id = fulfillment_tracking_id;
			const fulfillment_tracking_from_order =
				order_data?.data?.[0]?.fulfillments?.[0]?.labels?.[0]
					?.fulfillment_tracking?.id;

			// If no ID provided, try to extract from order_data
			if (!existing_id && fulfillment_tracking_from_order) {
				existing_id = fulfillment_tracking_from_order;
			}

			if (!existing_id) {
				logger.error('No fulfillment tracking ID found to update');
				throw new Error(
					'Cannot update fulfillment tracking: no existing ID found',
				);
			}

			// Capture original state for compensation
			const original_tracking =
				await fulfillmentTrackingService.retrieveFulfillmentTracking(
					existing_id,
				);

			let processed_tracking_events: TrackingEvent[] = tracking_events || [];
			let processed_current_status = current_status;

			// If express_info is provided, extract tracking events from it
			const express_list = express_info?.data?.expressList;
			if (express_list?.length > 0) {
				const express_item = express_list[0];

				processed_tracking_events = (express_item.traceDetails || []).map(
					(detail: TraceDetail) => ({
						seq_num: detail.seqNum,
						remark: detail.remark,
						accept_time: new Date(detail.acceptTime).toISOString(),
					}),
				);

				processed_current_status =
					express_item.currentScanType || current_status;
			}

			const fulfillment_tracking =
				await fulfillmentTrackingService.updateFulfillmentTrackings([
					{
						id: existing_id,
						current_status: processed_current_status,
						tracking_events: processed_tracking_events as unknown as Record<
							string,
							unknown
						>,
					},
				]);

			return new StepResponse(fulfillment_tracking, {
				original_tracking,
				tracking_id: existing_id,
			});
		} catch (error) {
			logger.error('Failed to update fulfillment tracking:', error);
			throw error;
		}
	},
);

export default updateFulfillmentTrackingStep;

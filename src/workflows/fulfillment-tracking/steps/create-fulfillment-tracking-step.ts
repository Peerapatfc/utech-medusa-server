import { createStep, StepResponse } from '@medusajs/framework/workflows-sdk';
import type { Logger } from '@medusajs/framework/types';
import type FulfillmentTrackingService from '../../../modules/fulfillment-tracking/service';
import { FULFILLMENT_TRACKING_MODULE } from '../../../modules/fulfillment-tracking';
import type {
	TraceDetail,
	TrackingEvent,
	CreateFulfillmentTrackingInput,
} from '../../../types/fulfillment-tracking';

const createFulfillmentTrackingStep = createStep(
	'create-fulfillment-tracking-step',
	async (input: CreateFulfillmentTrackingInput, { container }) => {
		const { tracking_events, current_status, express_info } = input;
		const logger: Logger = container.resolve('logger');
		const fulfillmentTrackingService: FulfillmentTrackingService =
			container.resolve(FULFILLMENT_TRACKING_MODULE);

		try {
			let processed_tracking_events: TrackingEvent[] = tracking_events || [];
			let processed_current_status = current_status;

			// If express_info is provided, extract tracking events from it
			if (express_info?.data?.expressList?.[0]) {
				const express_item = express_info.data.expressList[0];

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
				await fulfillmentTrackingService.createFulfillmentTrackings([
					{
						current_status: processed_current_status,
						tracking_events: processed_tracking_events as unknown as Record<
							string,
							unknown
						>,
					},
				]);

			return new StepResponse(fulfillment_tracking);
		} catch (error) {
			logger.error('Failed to create fulfillment tracking:', error);
			throw error;
		}
	},
);

export default createFulfillmentTrackingStep;

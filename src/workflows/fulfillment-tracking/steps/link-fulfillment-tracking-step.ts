import { createStep, StepResponse } from '@medusajs/framework/workflows-sdk';
import type { Logger } from '@medusajs/framework/types';
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils';
import { FULFILLMENT_TRACKING_MODULE } from '../../../modules/fulfillment-tracking';
import type { LinkFulfillmentTrackingInput } from '../../../types/fulfillment-tracking';

const linkFulfillmentTrackingStep = createStep(
	'link-fulfillment-tracking-step',
	async (input: LinkFulfillmentTrackingInput, { container }) => {
		const { order_data, fulfillment_tracking } = input;
		const logger: Logger = container.resolve('logger');
		const linkService = container.resolve(ContainerRegistrationKeys.LINK);

		try {
			// Extract fulfillment data from order_data
			const fulfillment = order_data?.data?.[0]?.fulfillments;

			if (
				!fulfillment ||
				fulfillment.length === 0 ||
				!fulfillment[0]?.labels?.length
			) {
				return new StepResponse(null);
			}

			if (!fulfillment_tracking || fulfillment_tracking.length === 0) {
				return new StepResponse(null);
			}

			const label_id = fulfillment[0].labels[0].id;
			const tracking_id = fulfillment_tracking[0].id;

			const link_result = await linkService.create({
				[Modules.FULFILLMENT]: {
					fulfillment_label_id: label_id,
				},
				[FULFILLMENT_TRACKING_MODULE]: {
					fulfillment_tracking_id: tracking_id,
				},
			});

			return new StepResponse(link_result, {
				label_id,
				tracking_id,
			});
		} catch (error) {
			logger.error('Failed to link fulfillment and tracking:', error);
			throw error;
		}
	},
);

export default linkFulfillmentTrackingStep;

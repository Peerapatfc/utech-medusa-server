import { createStep, StepResponse } from '@medusajs/framework/workflows-sdk';
import type { Logger } from '@medusajs/framework/types';
import type FulfillmentTrackingService from '../../../modules/fulfillment-tracking/service';
import { FULFILLMENT_TRACKING_MODULE } from '../../../modules/fulfillment-tracking';
import type { FetchExpressInfoInput } from '../../../types/fulfillment-tracking';

const fetchExpressInfoStep = createStep(
	'fetch-express-info-step',
	async (input: FetchExpressInfoInput, { container }) => {
		const { order_data, auth_response } = input;
		const logger: Logger = container.resolve('logger');
		const fulfillmentTrackingService: FulfillmentTrackingService =
			container.resolve(FULFILLMENT_TRACKING_MODULE);

		try {
			// Check if we have order data and tracking number
			const tracking_number =
				order_data?.data?.[0]?.fulfillments?.[0]?.labels?.[0]?.tracking_number;
			if (!tracking_number) {
				return new StepResponse(null);
			}

			// Check if authentication was successful
			if (!auth_response.success || !auth_response.data?.token) {
				logger.error('Authentication failed, cannot fetch express info');
				throw new Error('Authentication failed');
			}

			const token = auth_response.data.token;
			const express_info = await fulfillmentTrackingService.fetchExpressInfo(
				token,
				tracking_number,
			);

			return new StepResponse(express_info);
		} catch (error) {
			logger.error('Failed to fetch express info:', error);
			throw error;
		}
	},
);

export default fetchExpressInfoStep;

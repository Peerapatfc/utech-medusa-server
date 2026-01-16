import { createStep, StepResponse } from '@medusajs/framework/workflows-sdk';
import type { Logger } from '@medusajs/framework/types';
import type FulfillmentTrackingService from '../../../modules/fulfillment-tracking/service';
import { FULFILLMENT_TRACKING_MODULE } from '../../../modules/fulfillment-tracking';
import type { AuthResponse } from '../../../types/fulfillment-tracking';

const authenticateStep = createStep(
	'authenticate-step',
	async (_, { container }) => {
		const logger: Logger = container.resolve('logger');
		const fulfillmentTrackingService: FulfillmentTrackingService =
			container.resolve(FULFILLMENT_TRACKING_MODULE);

		try {
			const auth_response: AuthResponse =
				await fulfillmentTrackingService.authenticate();

			if (!auth_response.success) {
				logger.error(`Authentication failed: ${auth_response.error}`);
				throw new Error(`Authentication failed: ${auth_response.error}`);
			}

			return new StepResponse(auth_response);
		} catch (error) {
			logger.error('Failed to authenticate with tracking service:', error);
			throw error;
		}
	},
);

export default authenticateStep;

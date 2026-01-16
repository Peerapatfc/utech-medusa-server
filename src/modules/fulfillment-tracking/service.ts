import FulfillmentTracking from './models/fulfillment-tracking';
import { MedusaService } from '@medusajs/framework/utils';
import type { Logger } from '@medusajs/framework/types';
import type { ExpressInfo } from '../../types/fulfillment-tracking';
import axios from 'axios';

export default class FulfillmentTrackingService extends MedusaService({
	FulfillmentTracking,
}) {
	protected LOGIN_URL = process.env.FULFILLMENT_TRACKING_LOGIN_URL;
	protected INFO_URL = process.env.FULFILLMENT_TRACKING_INFO_URL;
	protected ACCOUNT = process.env.FULFILLMENT_TRACKING_ACCOUNT;
	protected logger: Logger;

	constructor(container: { logger: Logger }) {
		super(container);
		this.logger = container.logger;
	}

	/**
	 * Authenticate and get token
	 * @returns Promise<{success: boolean, data?: {token: string}, error?: string}>
	 */
	async authenticate(): Promise<{
		success: boolean;
		data?: { token: string };
		error?: string;
	}> {
		if (!this.LOGIN_URL || !this.ACCOUNT) {
			return {
				success: false,
				error: 'Login URL or account is not set',
			};
		}

		try {
			const params = {
				account: this.ACCOUNT,
				mode: 2,
			};

			const response = await axios.post(this.LOGIN_URL, params, {
				headers: {
					'Content-Type': 'application/json',
				},
			});

			return response.data;
		} catch (error) {
			this.logger.error('Authentication failed:', error);
			return {
				success: false,
				error:
					error instanceof Error
						? error.message
						: 'Unknown authentication error',
			};
		}
	}

	/**
	 * Fetch express information using token and order number
	 * @param token - Bearer token from authentication
	 * @param orderNumber - Order tracking number
	 * @returns Promise<any>
	 */
	async fetchExpressInfo(
		token: string,
		orderNumber: string,
	): Promise<ExpressInfo> {
		try {
			const params = {
				expressIds: [orderNumber],
			};

			const response = await axios.post(this.INFO_URL, params, {
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
			});

			return response.data;
		} catch (error) {
			this.logger.error('Failed to fetch express info:', error);
			throw error;
		}
	}
}

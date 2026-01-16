import { MedusaRequest, MedusaResponse } from '@medusajs/framework';
import { PushSubscription } from 'web-push';
import StoreNotificationService from '../../../../modules/store-notification/service';

export const POST = async (
	req: MedusaRequest<{
		subscription: PushSubscription | null | undefined;
	}>,
	res: MedusaResponse,
) => {
	const logger = req.scope.resolve('logger');
	const storeNotifictionService: StoreNotificationService = req.scope.resolve(
		'storeNotificationModuleService',
	);

	const { subscription } = req.body;
	if (!subscription) {
		return res.status(400).json({
			message: 'subscription is required',
			success: false,
		});
	}

	const { endpoint, keys, expirationTime } = subscription;
	if (!endpoint || !keys) {
		return res.status(400).json({
			message: 'Endpoint and keys are required',
			success: false,
		});
	}
	const notificationSubscription = {
		endpoint,
		keys: {
			auth: keys.auth,
			p256dh: keys.p256dh,
		},
		expiration_time: expirationTime,
	};

	try {
		const notificationSubscriptionModel =
			await storeNotifictionService.createNotificationSubscriptionModels(
				notificationSubscription,
			);

		logger.info('Notification subscription created successfully');

		res.json({
			message: 'Notification subscription created successfully',
			success: true,
			notification_subscription: notificationSubscriptionModel,
		});
	} catch (error) {
		logger.error('Failed to create notification subscription', error.message);
		res.status(500).json({
			message: 'Failed to create notification subscription',
			success: false,
			error: error.message,
		});
	}
};

export const DELETE = async (
	req: MedusaRequest<{
		subscription: PushSubscription | null | undefined;
	}>,
	res: MedusaResponse,
) => {
	const logger = req.scope.resolve('logger');
	const storeNotifictionService: StoreNotificationService = req.scope.resolve(
		'storeNotificationModuleService',
	);

	const { subscription } = req.body;
	if (!subscription) {
		return res.status(400).json({
			message: 'subscription is required',
			success: false,
		});
	}

	const { endpoint } = subscription;
	if (!endpoint) {
		return res.status(400).json({
			message: 'Endpoint are required',
			success: false,
		});
	}

	try {
		await storeNotifictionService.softDeleteNotificationSubscriptionModels({
			endpoint,
		});

		logger.info('Notification subscription deleted successfully');

		res.json({
			message: 'Notification subscription deleted successfully',
			success: true,
		});
	} catch (error) {
		logger.error('Failed to delete notification subscription', error.message);
		res.status(500).json({
			message: 'Failed to delete notification subscription',
			success: false,
			error: error.message,
		});
	}
};

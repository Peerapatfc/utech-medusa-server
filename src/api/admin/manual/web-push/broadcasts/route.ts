import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { PushSubscription } from 'web-push';
import { sendNotificationWebPush } from '../../../../../utils/web-push';
import StoreNotificationService from '../../../../../modules/store-notification/service';

export const POST = async (
	req: MedusaRequest<{
		title: string;
		body: string;
	}>,
	res: MedusaResponse,
) => {
	const logger = req.scope.resolve('logger');
	const storeNotificationService: StoreNotificationService = req.scope.resolve(
		'storeNotificationModuleService',
	);

	const subscriptions =
		await storeNotificationService.listNotificationSubscriptionModels({});

	const randomString = Math.random().toString(36).substring(2, 15);

	const title =
		req.body.title || `Hey, this is a push notification! ${randomString}`;
	const body = req.body.body || `This is a notification ${randomString}`;
	const notification = {
		title,
		body,
		icon: 'https://example.com/icon.png',
		data: {
			url: 'https://example.com',
		},
	};

	let sentCount = 0;
	for await (const subscription of subscriptions) {
		try {
			const subscriptionData: PushSubscription = {
				endpoint: subscription.endpoint,
				keys: {
					auth: subscription.keys.auth as string,
					p256dh: subscription.keys.p256dh as string,
				},
			};

			logger.info(`Sending notification to subscription: ${subscription.id}`);
			const sendResult = await sendNotificationWebPush(
				subscriptionData,
				JSON.stringify(notification),
			);

			logger.info(
				`Notification sent to subscription: ${subscription.id}, result: ${sendResult.statusCode}`,
			);
			sentCount++;
		} catch (error) {
			const errorMessage =
				typeof error === 'object' && error !== null && 'message' in error
					? error.message
					: String(error);

			logger.error('Failed to send notification', errorMessage);

			// Optional: log statusCode if available
			if (
				typeof error === 'object' &&
				error !== null &&
				'statusCode' in error
			) {
				logger.error('Push failed with status code', error.statusCode);
			}
		}
	}

	res.status(200).json({
		message: 'Notifications sent successfully',
		success: true,
		sent_count: sentCount,
	});
};

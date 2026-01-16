import type {
	AuthenticatedMedusaRequest,
	MedusaResponse,
} from '@medusajs/framework/http';
import { STORE_NOTIFICATION_MODULE } from '../../../../modules/store-notification';
import type StoreNotificationProviderService from '../../../../modules/store-notification/service';
import pushNotificationWorkflow from '../../../../workflows/store-notification/push-notification-workflow';

/**
 * Test push notification workflow
 */
export async function POST(
	req: AuthenticatedMedusaRequest,
	res: MedusaResponse,
): Promise<void> {
	try {
		const { id } = req.body as { id?: string };

		if (!id) {
			res.status(400).json({ message: 'Notification ID is required' });
			return;
		}

		// Verify that the notification exists
		const storeNotificationsService: StoreNotificationProviderService =
			req.scope.resolve(STORE_NOTIFICATION_MODULE);

		const notification =
			await storeNotificationsService.retrieveStoreNotificationModel(id);

		if (!notification) {
			res
				.status(404)
				.json({ message: `Store notification with ID ${id} not found` });
			return;
		}

		// Run the workflow with proper input format
		const { result } = await pushNotificationWorkflow(req.scope).run({
			input: { id },
		});

		res.status(200).json({
			message: 'Push notification workflow triggered successfully',
			result,
		});
	} catch (error) {
		res.status(500).json({
			message: 'Failed to trigger push notification workflow',
			error: error instanceof Error ? error.message : 'Unknown error',
		});
	}
}

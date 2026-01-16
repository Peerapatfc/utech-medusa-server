import type { MedusaRequest, MedusaResponse } from '@medusajs/framework';
import type { CreateNotificationDTO } from '@medusajs/framework/types';
import { Modules } from '@medusajs/framework/utils';

export const POST = async (
	req: MedusaRequest<{
		subject: string;
		text: string;
		recipients: string[];
	}>,
	res: MedusaResponse,
) => {
	const { body } = req;
	const notificationService = req.scope.resolve(Modules.NOTIFICATION);

	try {
		const notifications: CreateNotificationDTO[] = body.recipients.map(
			(recipient) => ({
				channel: 'store-notification',
				template: 'default',
				to: recipient,
				content: {
					subject: body.subject,
					text: body.text,
				},
				data: {
					subject: body.subject,
					text: body.text,
				},
				receiver_id: recipient,
				resource_type: '',
			}),
		);

		await notificationService.createNotifications(notifications);
		res.status(200).json({ success: true });
	} catch (error) {
		res.status(400).json({ success: false, message: error.message });
	}
};

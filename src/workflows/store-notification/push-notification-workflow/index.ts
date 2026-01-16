import {
	WorkflowResponse,
	createWorkflow,
} from '@medusajs/framework/workflows-sdk';
import { getRecipient } from './steps/get-recepient';
import { getStoreNotification } from './steps/get-store-notification';
import { sendNotification } from './steps/send-notification';
import { updateSentStatus } from './steps/update-sent-status';

export type WorkflowInput = {
	id: string;
};

const pushNotificationWorkflow = createWorkflow(
	'push-notification-workflow',
	(input: WorkflowInput) => {
		// step1: get store-notification
		const { storeNotification } = getStoreNotification({ id: input.id });

		// step2: get recipients based on recipient type
		const { customerIds } = getRecipient({ storeNotification });

		// step3: send notifications
		const { sent, success, message } = sendNotification({
			storeNotification,
			customerIds,
		});

		// step4: update sent status
		const { updated, message: updateMessage } = updateSentStatus({
			storeNotification,
			sent,
			success,
		});

		return new WorkflowResponse({
			storeNotification,
			customerIds,
			notification_result: {
				sent,
				success,
				message,
				status_updated: updated,
				update_message: updateMessage,
			},
		});
	},
);

export default pushNotificationWorkflow;

import {
	createWorkflow,
	WorkflowResponse,
} from '@medusajs/framework/workflows-sdk';
import { getRecipient } from './steps/get-recepient';
import { sendFlashSaleNotification } from './steps/send-notification';
import getCurrentProductFlashSaleStep from './steps/get-current-product-flash-sale';
import { updateSentStatus } from './steps/update-sent-status';

export const ONE_DAY = 60 * 60 * 24 * 1;

const flashSalePushNotificationWishlistWorkflow = createWorkflow(
	{
		name: 'flash-sale-push-notification-wishlist-workflow',
		store: true,
		idempotent: true,
		retentionTime: ONE_DAY,
	},
	() => {
		// step1: get incoming flash sale
		const { currentProductFlashSales } = getCurrentProductFlashSaleStep();

		// step2: mapping customer that has wish list with flash sale product
		const { customerProductFlashSales } = getRecipient({
			currentProductFlashSales,
		});

		// step3: send push notification to customer
		sendFlashSaleNotification({
			customerProductFlashSales,
		});

		// step4: update sent status
		updateSentStatus({
			currentProductFlashSales,
		});

		return new WorkflowResponse({});
	},
);

export default flashSalePushNotificationWishlistWorkflow;

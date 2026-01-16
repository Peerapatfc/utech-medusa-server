import { createStep, StepResponse } from '@medusajs/framework/workflows-sdk';
import type { INotificationModuleService } from '@medusajs/framework/types';
import { Modules } from '@medusajs/framework/utils';
import type { SendEmailInput } from '../type';

const sendEmailStep = createStep(
	'send-order-cancelled-email-step',
	async (input: SendEmailInput, { container }) => {
		const { orderDetail } = input;
		const notificationModuleService: INotificationModuleService =
			container.resolve(Modules.NOTIFICATION);

		const orderNo = orderDetail?.metadata?.order_no || '';
		const payload = {
			first_name: orderDetail?.shipping_address?.first_name || '',
			landing_page_url: process.env.MEDUSA_FRONTEND_URL,
			orderNo,
		};

		await notificationModuleService.createNotifications({
			to: orderDetail.email,
			channel: 'email',
			template: process.env.SENDGRID_ORDER_CANCELED_ID,
			data: payload,
		});

		return new StepResponse({});
	},
);

export default sendEmailStep;

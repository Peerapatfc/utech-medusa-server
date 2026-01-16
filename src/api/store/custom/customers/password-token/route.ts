import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import type { ResetPasswordBody } from '../../../../../types/password';
import FormValidator from '../../../../../utils/form-validator';
import { Modules, generateJwtToken } from '@medusajs/framework/utils';
import type {
	ICustomerModuleService,
	INotificationModuleService,
} from '@medusajs/framework/types';

export const POST = async (
	req: MedusaRequest<ResetPasswordBody>,
	res: MedusaResponse,
) => {
	try {
		const { email } = req.body;

		// Validator Format Email
		const emailFormValidator = FormValidator.email(email);

		if (!emailFormValidator.success) {
			return res.status(400).json({
				status: 400,
				message: emailFormValidator.message,
				data: email,
			});
		}

		//Get Customer Service
		const customerModuleService: ICustomerModuleService = req.scope.resolve(
			Modules.CUSTOMER,
		);

		// Check if customer with email exists
		const customer = await customerModuleService
			.listCustomers({ email, has_account: true }, { take: 1 })
			.then((customers) => customers[0]);

		if (!customer) {
			return res.status(200).json({ success: true });
		}

		const customerId = customer.id;
		const customerMetaData = customer.metadata;

		// Generate JwtToken
		const payload = {
			customerId,
			email,
		};

		const customerToken = generateJwtToken(payload, {
			secret: process.env.JWT_SECRET,
			expiresIn: '15m',
		});

		//update Metadata customer
		await customerModuleService.updateCustomers(customerId, {
			metadata: { ...customerMetaData, forgot_password_token: customerToken },
		});

		// sent email reset password
		const notificationModuleService: INotificationModuleService =
			req.scope.resolve(Modules.NOTIFICATION);

		await notificationModuleService.createNotifications({
			to: email,
			channel: 'email',
			template: process.env.SENDGRID_FORGOT_PASSWORD_ID,
			data: {
				first_name: customer.first_name,
				landing_page_url: process.env.MEDUSA_FRONTEND_URL,
				url: {
					reset_password: `${process.env.MEDUSA_FRONTEND_URL}/reset-password?token=${customerToken}`,
				},
			},
		});

		return res.status(200).json({ success: true, customerToken });
	} catch (error) {
		return res
			.status(500)
			.json({ message: 'An error occurred.', error: error.message });
	}
};

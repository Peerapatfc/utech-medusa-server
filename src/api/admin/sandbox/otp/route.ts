import type { MedusaRequest, MedusaResponse } from '@medusajs/framework';
import { AUTH_OTP_MODULE_SERVICE } from '@zimpligital/medusa-plugin-auth-otp/modules/auth-otp';

export const POST = async (
	req: MedusaRequest<{
		phone: string;
		country_code: string;
	}>,
	res: MedusaResponse,
) => {
	const { phone, country_code } = req.body;
	const authOTPModuleService = req.scope.resolve(AUTH_OTP_MODULE_SERVICE);

	try {
		const fullPhone = `+${country_code}${phone}`;
		const resp = await authOTPModuleService.sendSMS({
			to: fullPhone,
			otp: '123456',
			ref_code: 'REFCODE',
		});
		res.status(200).json({ resp });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

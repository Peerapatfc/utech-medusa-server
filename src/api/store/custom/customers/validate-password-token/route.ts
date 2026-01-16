import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import jwt from 'jsonwebtoken';
import type { ICustomerModuleService } from '@medusajs/framework/types';
import { Modules } from '@medusajs/framework/utils';
import type { TokenPasswordBody } from '../../../../../types/password';

export const POST = async (
	req: MedusaRequest<TokenPasswordBody>,
	res: MedusaResponse,
) => {
	try {
		const { token } = req.body;

		if (!token) {
			return res.status(400).json({ message: 'Token is require' });
		}

		if (typeof token !== 'string') {
			return res.status(400).json({ message: 'Invalid token format' });
		}

		// validate token
		const decoded = jwt.verify(token, process.env.JWT_SECRET) as {
			customerId: string;
		};
		const customerId = decoded.customerId;

		if (!customerId) {
			return res.status(401).json({ message: 'Invalid token' });
		}

		// check token in metadata
		const customerModuleService: ICustomerModuleService = req.scope.resolve(
			Modules.CUSTOMER,
		);

		const customer = await customerModuleService.retrieveCustomer(customerId);

		if (customer.metadata.forgot_password_token !== token) {
			return res.status(401).json({ message: 'Token mismatch' });
		}

		return res.status(200).json({ success: true, message: 'Token is valid' });
	} catch (error) {
		if (error.name === 'TokenExpiredError') {
			return res.status(401).json({ message: 'Token has expired' });
		}

		return res
			.status(500)
			.json({ message: 'An error occurred', error: error.message });
	}
};

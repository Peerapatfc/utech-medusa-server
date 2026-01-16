import type {
	MedusaResponse,
	AuthenticatedMedusaRequest,
} from '@medusajs/framework';
import { Modules } from '@medusajs/framework/utils';
import type { IAuthModuleService } from '@medusajs/framework/types';
import Scrypt from 'scrypt-kdf';

interface UpdatePasswordPayload {
	customerId: string;
	email: string;
	new_password: string;
}

export const POST = async (
	req: AuthenticatedMedusaRequest,
	res: MedusaResponse,
) => {
	const body = req.body as UpdatePasswordPayload;
	const { new_password } = body;
	const customerId = req.auth_context.actor_id;

	if (!customerId || !new_password) {
		return res
			.status(400)
			.json({ success: false, message: 'new password is require' });
	}

	const customerService = req.scope.resolve(Modules.CUSTOMER);

	const customer = await customerService.retrieveCustomer(customerId);

	if (!customer) {
		return res
			.status(400)
			.json({ success: false, message: 'No account found with that email' });
	}

	const authService: IAuthModuleService = req.scope.resolve(Modules.AUTH);

	try {
		const providerIdentity = await authService
			.listProviderIdentities({
				entity_id: customer.email,
				provider: 'emailpass',
			})
			.then((res) => res[0]);
		if (!providerIdentity) {
			return res.status(404).json({
				success: false,
				message: 'No account found with that email',
			});
		}

		const passwordHash = await hashPassword(new_password);
		await authService.updateProviderIdentities({
			id: providerIdentity.id,
			provider_metadata: {
				password: passwordHash,
			},
		});

		return res.status(200).json({
			success: true,
			message: 'Update password success',
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: error?.message || 'An error occurred',
		});
	}
};

const hashPassword = async (password: string) => {
	const hashConfig = { logN: 15, r: 8, p: 1 };
	const passwordHash = await Scrypt.kdf(password, hashConfig);
	return passwordHash.toString('base64');
};

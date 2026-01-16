import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import type { IAuthModuleService, Logger } from '@medusajs/framework/types';
import { Modules, isString } from '@medusajs/framework/utils';
import jwt from 'jsonwebtoken';
import Scrypt from 'scrypt-kdf';

interface IUpdatePassword {
	token: string;
	email: string;
	password: string;
}

export const POST = async (
	req: MedusaRequest<IUpdatePassword>,
	res: MedusaResponse,
) => {
	const logger: Logger = req.scope.resolve('logger');
	const authService: IAuthModuleService = req.scope.resolve(Modules.AUTH);
	const { token, password } = req.body;

	if (!token) {
		logger.error('Token is required');
		return res.status(400).json({ message: 'Token is require' });
	}

	let email = '';
	let customerId = '';
	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET) as {
			customerId: string;
			email: string;
		};

		customerId = decoded.customerId;
		email = decoded.email;
		if (!customerId || !email) {
			logger.error('Invalid token');
			return res.status(401).json({ success: false, message: 'Invalid token' });
		}
	} catch (error) {
		return res.status(401).json({
			success: false,
			message: error?.message || 'Invalid token',
		});
	}

	if (!password || !isString(password)) {
		logger.error('Password is required');
		return res.status(400).json({
			success: false,
			message: 'Password is required',
		});
	}

	try {
		let authIdentityId = '';
		let providerIdentityId = '';
		const passwordHash = await hashPassword(password);
		const authIdentity = await authService
			.listAuthIdentities(
				{
					app_metadata: {
						customer_id: customerId as string,
					},
				},
				{
					relations: ['provider_identities'],
				},
			)
			.then((res) => res[0]);

		const providerIdentity = authIdentity?.provider_identities?.find(
			(identity) =>
				identity.provider === 'emailpass' && identity.entity_id === email,
		);
		authIdentityId = authIdentity?.id;
		providerIdentityId = providerIdentity?.id;

		if (!authIdentity && !providerIdentity) {
			// create auth identity and provider identity if they don't exist
			const authIdentity = await authService.createAuthIdentities({
				app_metadata: {
					customer_id: customerId,
				},
				provider_identities: [
					{
						provider: 'emailpass',
						entity_id: email,
						provider_metadata: {
							password: passwordHash,
						},
					},
				],
			});

			authIdentityId = authIdentity.id;
			providerIdentityId = authIdentity.provider_identities?.[0]?.id;
			logger.info(
				`Auth Identity & Provider Identity emailpass:${email}  created`,
			);
		}

		if (authIdentity && !providerIdentity) {
			// create identity provider only if it doesn't exist
			const newProviderIdentity = await authService.createProviderIdentities({
				auth_identity_id: authIdentityId,
				provider: 'emailpass',
				entity_id: email,
				provider_metadata: {
					password: passwordHash,
				},
			});
			providerIdentityId = newProviderIdentity.id;
			logger.info(`Provider Identity emailpass:${email}  created`);
		}

		if (!providerIdentityId) {
			logger.error('No provider identity found');
			return res.status(500).json({
				success: false,
				message: 'No provider identity found',
			});
		}

		await authService.updateProviderIdentities({
			id: providerIdentityId,
			provider_metadata: {
				password: passwordHash,
			},
		});

		return res.json({
			success: true,
			email: email,
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

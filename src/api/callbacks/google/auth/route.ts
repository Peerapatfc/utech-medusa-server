import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import type {
	AuthenticationInput,
	IAuthModuleService,
	ICustomerModuleService,
	INotificationModuleService,
	Logger,
} from '@medusajs/framework/types';
import { Modules, generateJwtToken } from '@medusajs/framework/utils';

export async function GET(req: MedusaRequest, res: MedusaResponse) {
	const logger: Logger = req.scope.resolve('logger');
	try {
		const customerModuleService: ICustomerModuleService = req.scope.resolve(
			Modules.CUSTOMER,
		);
		const authModuleService: IAuthModuleService = req.scope.resolve(
			Modules.AUTH,
		);
		const authIdentityProviderService: IAuthModuleService = req.scope.resolve(
			Modules.AUTH,
		);

		const notificationModuleService: INotificationModuleService =
			req.scope.resolve(Modules.NOTIFICATION);
		const authIdentity = await authModuleService.validateCallback('google', {
			url: req.url,
			headers: req.headers,
			query: req.query,
			body: req.body,
			protocol: req.protocol,
		} as AuthenticationInput);

		if (!authIdentity?.authIdentity) {
			logger.warn('No auth identity found');
			// throw new Error('No auth identity found');
			return res.json({
				token: '',
				message: 'No auth identity found',
			});
		}

		const { provider_identities } = authIdentity.authIdentity;
		const provider_identity = provider_identities.find(
			(identity) => identity.provider === 'google',
		);

		if (!provider_identity) {
			logger.error('No provider identity found');
			throw new Error('No provider identity found');
		}

		const email = provider_identity?.user_metadata?.email as string;
		if (!email) {
			logger.error('No email found in google profile');
			throw new Error('No email found in google profile');
		}

		let customer = await customerModuleService
			.listCustomers(
				{
					email,
					has_account: true,
				},
				{
					take: 1,
				},
			)
			.then((res) => res[0]);

		if (customer) {
			await customerModuleService.updateCustomers(customer.id, {
				metadata: {
					...customer.metadata,
					...provider_identity.user_metadata,
				},
			});
		}

		if (!customer) {
			const firstName =
				provider_identity?.user_metadata?.given_name?.toString();
			const lastName =
				provider_identity?.user_metadata?.family_name?.toString();

			customer = await customerModuleService.createCustomers({
				email,
				first_name: firstName || '',
				last_name: lastName || '',
				has_account: true,
				metadata: provider_identity.user_metadata,
			});

			await notificationModuleService
				.createNotifications({
					to: email,
					channel: 'email',
					template: process.env.SENDGRID_CUSTOMER_CREATED,
					data: {
						first_name: firstName,
						landing_page_url: process.env.MEDUSA_FRONTEND_URL,
					},
				})
				.catch((_error) => {});
		}

		await authIdentityProviderService.updateAuthIdentities([
			{
				id: authIdentity.authIdentity.id,
				app_metadata: {
					customer_id: customer.id,
				},
			},
		]);

		const payload = {
			actor_id: customer.id,
			actor_type: 'customer',
			auth_identity_id: authIdentity.authIdentity.id,
			app_metadata: {
				customer_id: customer.id,
			},
		};

		const customerToken = generateJwtToken(payload, {
			secret: process.env.JWT_SECRET,
			expiresIn: '3600s',
		});

		res.json({
			token: customerToken,
		});
	} catch (error) {
		logger.error(`callbacks google-auth error: ${error.message}`, error);
		res.json({
			token: null,
			message: error.message,
		});
	}
}

import type {
	MedusaNextFunction,
	MedusaRequest,
	MedusaResponse,
	MiddlewareRoute,
} from '@medusajs/framework/http';
import type { IApiKeyModuleService } from '@medusajs/framework/types';
import { Modules } from '@medusajs/framework/utils';

const validateAPIKey = async (
	req: MedusaRequest,
	res: MedusaResponse,
	next: MedusaNextFunction,
) => {
	const apiKey = req.headers['x-publishable-api-key'];
	if (!apiKey) {
		return res.status(401).json({
			success: false,
			message: 'Unauthorized: No API key provided',
		});
	}

	const apiKeyService: IApiKeyModuleService = req.scope.resolve(
		Modules.API_KEY,
	);
	const apiKeys = await apiKeyService.listApiKeys({});
	const strapiApiKey = apiKeys.find((k) =>
		k.title.toLocaleLowerCase().includes('strapi'),
	);
	if (!strapiApiKey) {
		return res.status(401).json({
			success: false,
			message: 'Unauthorized: No API keys found',
		});
	}

	if (apiKey !== strapiApiKey.token) {
		return res.status(401).json({
			success: false,
			message: 'Unauthorized: Invalid API key',
		});
	}

	next();
};

export const hooksStrapiRoutesMiddlewares: MiddlewareRoute[] = [
	{
		method: ['ALL'],
		matcher: '/hooks/strapi/*',
		middlewares: [validateAPIKey],
	},
];

import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { version } from '../../../../package.json';

export async function GET(
	req: MedusaRequest,
	res: MedusaResponse,
): Promise<void> {
	const response = {
		status: 'ok',
		version,
		message: 'API is running',
		backendUrl: process.env.MEDUSA_BACKEND_URL || '',
		storefrontUrl: process.env.MEDUSA_FRONTEND_URL || '',
	};

	res.status(200).json(response);
}

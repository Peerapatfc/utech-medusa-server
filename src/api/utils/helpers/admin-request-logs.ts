import type {
	AuthenticatedMedusaRequest,
	MedusaNextFunction,
	MedusaResponse,
} from '@medusajs/framework/http';
import type { Logger } from '@medusajs/framework/types';
import { ADMIN_MODULE } from '../../../modules/admin';
import type AdminModuleService from '../../../modules/admin/service';

export const logAdminRequests = (
	req: AuthenticatedMedusaRequest,
	_res: MedusaResponse,
	next: MedusaNextFunction,
) => {
	const { path, query, body, auth_context, method } = req;
	const logger: Logger = req.scope.resolve('logger');
	const adminService: AdminModuleService = req.scope.resolve(ADMIN_MODULE);
	try {
		adminService.createAdminLogRequests({
			path,
			method,
			query: query as unknown as Record<string, unknown>,
			body: body as unknown as Record<string, unknown>,
			actor_id: (auth_context?.actor_id as string) || '',
		});
	} catch (error) {
		logger.error(`Error logging admin request: ${error?.message}`);
	}

	next();
};

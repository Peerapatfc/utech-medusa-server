import type {
	AuthenticatedMedusaRequest,
	MedusaNextFunction,
	MedusaResponse,
} from '@medusajs/framework/http';
import { ADMIN_MODULE } from '../../../modules/admin';
import type AdminModuleService from '../../../modules/admin/service';
import { getOrderById } from './common/order';

export const logCancelOrder = async (
	req: AuthenticatedMedusaRequest,
	_res: MedusaResponse,
	next: MedusaNextFunction,
) => {
	const adminService: AdminModuleService = req.scope.resolve(ADMIN_MODULE);
	const order_id = req.params.id;

	try {
		const order = await getOrderById(req.scope, order_id);
		const actor_id = req.auth_context?.actor_id || '';
		adminService.createAdminLogs({
			action: 'canceled',
			resource_id: order_id,
			resource_type: 'order',
			actor_id,
			metadata: {
				order_id,
				order_no: order?.metadata?.order_no,
			},
		});
	} catch (e) {}
	next();
};

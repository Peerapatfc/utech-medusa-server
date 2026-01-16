import type {
	AuthenticatedMedusaRequest,
	MedusaNextFunction,
	MedusaResponse,
} from '@medusajs/framework/http';
import { ADMIN_MODULE } from '../../../modules/admin';
import type AdminModuleService from '../../../modules/admin/service';
import { getOrderByPaymentId } from './common/order';

export const logCapturePayment = async (
	req: AuthenticatedMedusaRequest,
	_res: MedusaResponse,
	next: MedusaNextFunction,
) => {
	const adminService: AdminModuleService = req.scope.resolve(ADMIN_MODULE);
	const payment_id = req.params.id;

	try {
		const order = await getOrderByPaymentId(req.scope, payment_id);
		const order_id = order?.id;
		const actor_id = req.auth_context?.actor_id || '';
		adminService.createAdminLogs({
			action: 'captured',
			resource_id: order_id,
			resource_type: 'payment',
			actor_id,
			metadata: {
				order_id,
				order_no: order?.metadata?.order_no,
			},
		});
	} catch (e) {}
	next();
};

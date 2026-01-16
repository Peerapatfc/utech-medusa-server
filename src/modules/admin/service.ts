import { MedusaService } from '@medusajs/framework/utils';
import { AdminLog } from './models/admin-logs';
import AdminLogRequests from './models/admin-log-requests';
import InventoryItemLog from './models/inventory-item-logs';
import ProductPricingLog from './models/product-pricing-logs';
import HookLog from './models/hook-logs';
interface AddLog {
	path: string;
	method: string;
	actor_id: string;
}

class AdminModuleService extends MedusaService({
	AdminLog,
	AdminLogRequests,
	InventoryItemLog,
	ProductPricingLog,
	HookLog,
}) {
	// addAdminLog(data: AddLog) {
	// 	const log = this.prepareAddAdminLog(data);
	// 	if (!log) return Promise.resolve();
	// 	return this.createAdminLogs(log);
	// }
	// prepareAddAdminLog(data: AddLog) {
	// 	const isProduct = data.path.includes('/admin/products');
	// 	if (isProduct) {
	// 		const separator = data.path.split('/');
	// 		const productId = separator[3];
	// 		const action =
	// 			data.method === 'DELETE'
	// 				? 'delete-product'
	// 				: productId
	// 					? 'update-product'
	// 					: 'create-product';
	// 		return {
	// 			action,
	// 			actor_id: data.actor_id,
	// 			resource_id: productId,
	// 			resource_type: 'product',
	// 		};
	// 	}
	// 	return null;
	// }
}

export default AdminModuleService;

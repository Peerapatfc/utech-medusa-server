import type { MedusaContainer } from '@medusajs/framework/types';
import type AdminModuleService from '../modules/admin/service';
import { ADMIN_MODULE } from '../modules/admin';

export default async function handlerClearAdminLogRequests(
	container: MedusaContainer,
) {
	if (process.env.NODE_ENV === 'development') {
		return;
	}

	const logger = container.resolve('logger');
	const adminService: AdminModuleService = container.resolve(ADMIN_MODULE);
	const before5Days = new Date(new Date().setDate(new Date().getDate() - 5));

	try {
		await adminService.deleteAdminLogRequests({
			created_at: {
				$lt: before5Days,
			},
		});
	} catch (error) {
		logger.error(`Error clearing admin log requests: ${error.message}`);
	}
}

export const config = {
	name: 'clear-admin-log-requests',
	schedule: '0 0 * * *', // every day at midnight
};

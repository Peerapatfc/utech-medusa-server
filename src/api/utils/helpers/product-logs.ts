import type {
	AuthenticatedMedusaRequest,
	MedusaNextFunction,
	MedusaResponse,
} from '@medusajs/framework/http';
import { ADMIN_MODULE } from '../../../modules/admin';
import type AdminModuleService from '../../../modules/admin/service';

export const logDeleteProduct = async (
	req: AuthenticatedMedusaRequest,
	_res: MedusaResponse,
	next: MedusaNextFunction,
) => {
	const adminService: AdminModuleService = req.scope.resolve(ADMIN_MODULE);
	const product_id = req.params.id;
	try {
		const actor_id = req.auth_context?.actor_id || '';
		adminService.createAdminLogs({
			action: 'deleted',
			resource_id: product_id,
			resource_type: 'product',
			actor_id,
		});
	} catch (e) {}
	next();
};

export const logCreateProductVariant = async (
	req: AuthenticatedMedusaRequest,
	_res: MedusaResponse,
	next: MedusaNextFunction,
) => {
	const adminService: AdminModuleService = req.scope.resolve(ADMIN_MODULE);
	const product_id = req.params.id;
	try {
		const actor_id = req.auth_context?.actor_id || '';
		adminService.createAdminLogs({
			action: 'created',
			resource_id: product_id,
			resource_type: 'product_variant',
			actor_id,
			metadata: {},
		});
	} catch (e) {}
	next();
};

export const logUpdateProductVariant = async (
	req: AuthenticatedMedusaRequest,
	_res: MedusaResponse,
	next: MedusaNextFunction,
) => {
	const adminService: AdminModuleService = req.scope.resolve(ADMIN_MODULE);
	const product_id = req.params.id;
	const variant_id = req.params.variant_id;
	try {
		const actor_id = req.auth_context?.actor_id || '';
		adminService.createAdminLogs({
			action: 'updated',
			resource_id: product_id,
			resource_type: 'product_variant',
			actor_id,
			metadata: {
				variant_id,
			},
		});
	} catch (e) {}
	next();
};

export const logDeleteProductVariant = async (
	req: AuthenticatedMedusaRequest,
	_res: MedusaResponse,
	next: MedusaNextFunction,
) => {
	const adminService: AdminModuleService = req.scope.resolve(ADMIN_MODULE);
	const product_id = req.params.id;
	const variant_id = req.params.variant_id;
	try {
		const actor_id = req.auth_context?.actor_id || '';
		adminService.createAdminLogs({
			action: 'deleted',
			resource_id: product_id,
			resource_type: 'product_variant',
			actor_id,
			metadata: {
				variant_id,
			},
		});
	} catch (e) {}
	next();
};

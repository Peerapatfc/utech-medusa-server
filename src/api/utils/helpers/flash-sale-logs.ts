import type { PriceListCustom } from '@customTypes/price-list-custom';
import type {
	AuthenticatedMedusaRequest,
	MedusaNextFunction,
	MedusaResponse,
} from '@medusajs/framework';
import { ContainerRegistrationKeys } from '@medusajs/framework/utils';
import type { Logger } from '@medusajs/medusa';
import { ADMIN_MODULE } from '../../../modules/admin';
import type AdminModuleService from '../../../modules/admin/service';

export const logCreateFlashSale = async (
	req: AuthenticatedMedusaRequest,
	flashSaleId: string,
) => {
	const actor_id = req.auth_context?.actor_id || '';

	const adminService: AdminModuleService = req.scope.resolve(ADMIN_MODULE);
	const logger: Logger = req.scope.resolve('logger');

	try {
		adminService.createAdminLogs({
			action: 'created',
			resource_id: flashSaleId,
			resource_type: 'flash_sale',
			actor_id,
		});
	} catch (e) {
		logger.error(`Error logging flashSale created: ${e?.message}`);
	}
};

export const logUpdateFlashSale = async (
	req: AuthenticatedMedusaRequest,
	_res: MedusaResponse,
	next: MedusaNextFunction,
) => {
	const flashSaleId = req.params.id;
	const actor_id = req.auth_context?.actor_id || '';

	const adminService: AdminModuleService = req.scope.resolve(ADMIN_MODULE);
	const logger: Logger = req.scope.resolve('logger');

	try {
		const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
		const { data: flashSalePriceLists } = (await query.graph({
			entity: 'price_list_custom',
			fields: ['*', 'price_list.*'],
			filters: {
				is_flash_sale: true,
			},
			pagination: {
				take: 9999,
				skip: 0,
			},
		})) as unknown as { data: PriceListCustom[] };

		const flashSalePriceListIds = flashSalePriceLists
			.map((flashSalePriceList) => flashSalePriceList.price_list?.id)
			.filter(Boolean);

		const isFlashSale = flashSalePriceListIds.includes(flashSaleId);

		if (isFlashSale) {
			adminService.createAdminLogs({
				action: 'updated',
				resource_id: flashSaleId,
				resource_type: 'flash_sale',
				actor_id,
			});
		}
	} catch (e) {
		logger.error(`Error logging flashSale updated: ${e?.message}`);
	}

	next();
};

export const logDeleteFlashSale = async (
	req: AuthenticatedMedusaRequest,
	flashSaleId: string,
) => {
	const actor_id = req.auth_context?.actor_id || '';

	const adminService: AdminModuleService = req.scope.resolve(ADMIN_MODULE);
	const logger: Logger = req.scope.resolve('logger');

	try {
		adminService.createAdminLogs({
			action: 'deleted',
			resource_id: flashSaleId,
			resource_type: 'flash_sale',
			actor_id,
		});

		adminService.updateAdminLogs({
			selector: {
				resource_id: flashSaleId,
			},
			data: {
				metadata: { isDelete: true },
			},
		});
	} catch (e) {
		logger.error(`Error logging flashSale deleted: ${e?.message}`);
	}
};

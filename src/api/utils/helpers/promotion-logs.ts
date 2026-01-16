import type {
	AuthenticatedMedusaRequest,
	MedusaNextFunction,
	MedusaResponse,
} from '@medusajs/framework';
import type { PromotionDTO } from '@medusajs/framework/types';
import { Modules } from '@medusajs/framework/utils';
import type { Logger, MedusaContainer } from '@medusajs/medusa';
import { ADMIN_MODULE } from '../../../modules/admin';
import type AdminModuleService from '../../../modules/admin/service';

const logPromotionActivity = async (
	container: MedusaContainer,
	promotionId: string,
	actorId: string,
	action: 'created' | 'updated',
) => {
	const adminService: AdminModuleService = container.resolve(ADMIN_MODULE);
	const logger: Logger = container.resolve('logger');
	const promotionService = container.resolve(Modules.PROMOTION);

	try {
		const promotion: PromotionDTO = await promotionService
			.retrievePromotion(promotionId, {
				withDeleted: true,
			})
			.catch(() => null);

		adminService.createAdminLogs({
			action,
			resource_id: promotionId,
			resource_type: 'promotion',
			actor_id: actorId,
			metadata: {
				campaign_id: promotion?.campaign_id || null,
			},
		});
	} catch (error) {
		logger.error(`Error logging promotion ${action}: ${error?.message}`);
	}
};

export const logCreatePromotionFromHooks = (
	container: MedusaContainer,
	promotionId: string,
	actorId: string,
) => logPromotionActivity(container, promotionId, actorId, 'created');

export const logUpdatePromotionFromHooks = (
	container: MedusaContainer,
	promotionId: string,
	actorId: string,
) => logPromotionActivity(container, promotionId, actorId, 'updated');

export const logDeletePromotion = async (
	req: AuthenticatedMedusaRequest,
	_res: MedusaResponse,
	next: MedusaNextFunction,
) => {
	const promotion_id = req.params.id;
	const actor_id = req.auth_context?.actor_id || '';

	const adminService: AdminModuleService = req.scope.resolve(ADMIN_MODULE);
	const promotionService = req.scope.resolve(Modules.PROMOTION);
	const logger: Logger = req.scope.resolve('logger');

	try {
		const promotion: PromotionDTO = await promotionService
			.retrievePromotion(promotion_id, {
				withDeleted: true,
			})
			.catch(() => null);

		adminService.createAdminLogs({
			action: 'deleted',
			resource_id: promotion_id,
			resource_type: 'promotion',
			actor_id,
			metadata: {
				campaign_id: promotion?.campaign_id || null,
			},
		});

		adminService.updateAdminLogs({
			selector: {
				resource_id: promotion_id,
			},
			data: {
				metadata: { isDelete: true },
			},
		});
	} catch (e) {
		logger.error(`Error logging promotion deleted: ${e?.message}`);
	}

	next();
};

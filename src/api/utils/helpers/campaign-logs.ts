import type {
	AuthenticatedMedusaRequest,
	MedusaNextFunction,
	MedusaResponse,
} from '@medusajs/framework';
import type { Logger, MedusaContainer } from '@medusajs/medusa';
import { ADMIN_MODULE } from '../../../modules/admin';
import type AdminModuleService from '../../../modules/admin/service';

const logCampaignActivity = async (
	container: MedusaContainer,
	campaignId: string,
	actorId: string,
	action: 'created' | 'updated',
) => {
	const adminService: AdminModuleService = container.resolve(ADMIN_MODULE);
	const logger: Logger = container.resolve('logger');

	try {
		adminService.createAdminLogs({
			action,
			resource_id: campaignId,
			resource_type: 'campaign',
			actor_id: actorId,
		});
	} catch (error) {
		logger.error(`Error logging campaign ${action}: ${error?.message}`);
	}
};

export const logCreateCampaignFromHooks = (
	container: MedusaContainer,
	campaignId: string,
	actorId: string,
) => logCampaignActivity(container, campaignId, actorId, 'created');

export const logUpdateCampaignFromHooks = (
	container: MedusaContainer,
	campaignId: string,
	actorId: string,
) => logCampaignActivity(container, campaignId, actorId, 'updated');

export const logDeleteCampaign = async (
	req: AuthenticatedMedusaRequest,
	_res: MedusaResponse,
	next: MedusaNextFunction,
) => {
	const campaign_id = req.params.id;
	const actor_id = req.auth_context?.actor_id || '';

	const adminService: AdminModuleService = req.scope.resolve(ADMIN_MODULE);
	const logger: Logger = req.scope.resolve('logger');

	try {
		adminService.createAdminLogs({
			action: 'deleted',
			resource_id: campaign_id,
			resource_type: 'campaign',
			actor_id,
		});

		adminService.updateAdminLogs({
			selector: {
				resource_id: campaign_id,
			},
			data: {
				metadata: { isDelete: true },
			},
		});
	} catch (e) {
		logger.error(`Error logging campaign deleted: ${e?.message}`);
	}

	next();
};

import { updateCampaignsWorkflow } from '@medusajs/medusa/core-flows';
import { logUpdateCampaignFromHooks } from 'src/api/utils/helpers/campaign-logs';
import { STOREFRONT_MODULE } from '../../../modules/storefront';
import type StorefrontModuleService from '../../../modules/storefront/service';
import { getActorId } from '../../../utils/workflow-hooks';

updateCampaignsWorkflow.hooks.campaignsUpdated(
	async ({ campaigns, additional_data }, { container }) => {
		const [campaign] = campaigns;

		const storefrontService: StorefrontModuleService =
			container.resolve(STOREFRONT_MODULE);
		await storefrontService.revalidateTag('coupons');

		const actorId = getActorId(additional_data);
		logUpdateCampaignFromHooks(container, campaign.id, actorId);
	},
);

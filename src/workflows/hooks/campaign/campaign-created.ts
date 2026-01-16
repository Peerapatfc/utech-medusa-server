import { createCampaignsWorkflow } from '@medusajs/medusa/core-flows';
import { logCreateCampaignFromHooks } from 'src/api/utils/helpers/campaign-logs';
import { STOREFRONT_MODULE } from '../../../modules/storefront';
import type StorefrontModuleService from '../../../modules/storefront/service';
import { getActorId } from '../../../utils/workflow-hooks';

createCampaignsWorkflow.hooks.campaignsCreated(
	async ({ campaigns, additional_data }, { container }) => {
		const [campaign] = campaigns;

		const storefrontService: StorefrontModuleService =
			container.resolve(STOREFRONT_MODULE);
		await storefrontService.revalidateTag('coupons');

		const actorId = getActorId(additional_data);
		logCreateCampaignFromHooks(container, campaign.id, actorId);
	},
);

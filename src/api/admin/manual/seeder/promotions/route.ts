import type { MedusaRequest, MedusaResponse } from '@medusajs/framework';

import { Modules } from '@medusajs/framework/utils';
import {
	createCampaignsWorkflow,
	type CreateCampaignsWorkflowInput,
	createPromotionsWorkflow,
	type CreatePromotionsWorkflowInput,
} from '@medusajs/medusa/core-flows';
import { campaigns } from './seeder-data';
import type { IPromotionModuleService } from '@medusajs/framework/types';

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
	const promotionService: IPromotionModuleService = req.scope.resolve(
		Modules.PROMOTION,
	);

	for await (const campaign of campaigns) {
		const existingCampaign = await promotionService
			.listCampaigns({
				campaign_identifier: [campaign.campaign_identifier],
			})
			.then((res) => res[0]);
		if (existingCampaign) continue;

		const campaignData: CreateCampaignsWorkflowInput = {
			campaignsData: [campaign],
		};
		const promotions = campaign.promotions;

		const { result: createdCampaigns } = await createCampaignsWorkflow(
			req.scope,
		).run({
			input: campaignData,
		});

		const campaignId = createdCampaigns[0].id;
		const promotionsData: CreatePromotionsWorkflowInput = {
			promotionsData: promotions.map((promotion) => {
				promotion.campaign_id = campaignId;
				return promotion;
			}),
		};

		await createPromotionsWorkflow(req.scope).run({
			input: promotionsData,
		});
	}

	res.status(200).json({ message: 'Campaigns and Promotions created' });
};

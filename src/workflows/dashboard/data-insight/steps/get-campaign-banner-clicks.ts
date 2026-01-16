import { StepResponse, createStep } from '@medusajs/framework/workflows-sdk';
import { HOMEPAGE_BANNER_MODULE } from 'src/modules/strapi/homepage-banner';
import { MINI_BANNER_MODULE } from 'src/modules/strapi/mini-banner';
import type MiniBannerService from 'src/modules/strapi/mini-banner/service';
import type { HomepageBanner, MiniBanner } from 'src/modules/strapi/type';
import type HomepageBannerService from '../../../../modules/strapi/homepage-banner/service';

export type GetCampaignBannerClicksStepInput = {
	limit?: number;
};

export const getCampaignBannerClicksStep = createStep(
	'get-campaign-banner-clicks-step',
	async (input: GetCampaignBannerClicksStepInput, { container }) => {
		const homepageBannerService: HomepageBannerService = container.resolve(
			HOMEPAGE_BANNER_MODULE,
		);
		const miniBannerService: MiniBannerService =
			container.resolve(MINI_BANNER_MODULE);

		const { limit } = input;

		const viewOrder = 'views:desc';

		const [homepageBannersData, miniBannersData] = await Promise.all([
			homepageBannerService.getListAll(limit, viewOrder),
			miniBannerService.getListAll(limit, viewOrder),
		]);

		const actualHomepageBanners: HomepageBanner[] = homepageBannersData
			? Array.isArray(homepageBannersData)
				? homepageBannersData
				: [homepageBannersData]
			: [];
		const actualMiniBanners: MiniBanner[] = miniBannersData
			? Array.isArray(miniBannersData)
				? miniBannersData
				: [miniBannersData]
			: [];

		const homepageBannersWithType = actualHomepageBanners.map((banner) => ({
			...banner,
			type: 'hero',
		}));

		const miniBannersWithType = actualMiniBanners.map((banner) => ({
			...banner,
			type: 'mini',
		}));

		const allBannersCombined = [
			...homepageBannersWithType,
			...miniBannersWithType,
		];

		const sortedBanners = allBannersCombined.sort((a, b) => b.views - a.views);
		const limitBanners = sortedBanners.slice(0, limit);

		const mappedBanners = limitBanners.map((banner) => ({
			id: `${banner.type}-${banner.id}`,
			name: banner.name ?? `${banner.type}-${banner.id}`,
			type: banner.type,
			count: banner.views ?? 0,
		}));

		return new StepResponse(mappedBanners);
	},
);

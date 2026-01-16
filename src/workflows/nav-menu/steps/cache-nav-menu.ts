import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils';
import { createStep, StepResponse } from '@medusajs/framework/workflows-sdk';
import { STOREFRONT_MODULE } from '../../../modules/storefront';
import StorefrontModuleService from '../../../modules/storefront/service';

type StepInput = {
	data: any;
};

const TTL = 86400; // 1 day

export const cacheNavMenuStep = createStep(
	'cache-nav-menu-step',
	async (input: StepInput, { container }) => {
		const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
		const cacheModuleService = container.resolve(Modules.CACHE);

		await cacheModuleService.set('nav_menus', input.data, TTL);
		logger.info('Nav menus cached successfully... from cache-nav-menu-step');

		const storefrontService: StorefrontModuleService =
			container.resolve(STOREFRONT_MODULE);
		await storefrontService.revalidateTags(['nav-menus']);

		return new StepResponse(null);
	},
);

import { createStep, StepResponse } from '@medusajs/framework/workflows-sdk';
import type StorefrontModuleService from '../../../modules/storefront/service';
import { STOREFRONT_MODULE } from '../../../modules/storefront';

type StepInput = {
	tags: string[];
};

export const revalidateStoreTagsStep = createStep(
	'revalidate-store-tags-step',
	async ({ tags }: StepInput, { container }) => {
		const storefrontService: StorefrontModuleService =
			container.resolve(STOREFRONT_MODULE);
		storefrontService.revalidateTags(tags);

		return new StepResponse({});
	},
);

export default revalidateStoreTagsStep;

import { deleteCollectionsWorkflow } from '@medusajs/medusa/core-flows';
import { STOREFRONT_MODULE } from '../../../modules/storefront';
import type StorefrontModuleService from '../../../modules/storefront/service';

deleteCollectionsWorkflow.hooks.collectionsDeleted(
	async ({ ids }, { container }) => {
		const tags = ['collections'];
		for (const id of ids) {
			tags.push(`collections-${id}`);
		}
		const storefrontService: StorefrontModuleService =
			container.resolve(STOREFRONT_MODULE);
		await storefrontService.revalidateTags(tags);
	},
);

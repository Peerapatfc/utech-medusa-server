import { updateCollectionsWorkflow } from '@medusajs/medusa/core-flows';
import { STOREFRONT_MODULE } from '../../../modules/storefront';
import type StorefrontModuleService from '../../../modules/storefront/service';
import type { IProductModuleService } from '@medusajs/framework/types';
import { Modules } from '@medusajs/framework/utils';

updateCollectionsWorkflow.hooks.collectionsUpdated(
	async ({ collections }, { container }) => {
		const productService: IProductModuleService = container.resolve(
			Modules.PRODUCT,
		);
		const tags = ['collections'];
		for (const collection of collections) {
			tags.push(`collections-${collection.id}`);
			await productService.updateProductCollections(collection.id, {
				handle: collection.handle.replace(/\s+/g, '-'),
			});
		}

		const storefrontService: StorefrontModuleService =
			container.resolve(STOREFRONT_MODULE);
		await storefrontService.revalidateTags(tags);
	},
);

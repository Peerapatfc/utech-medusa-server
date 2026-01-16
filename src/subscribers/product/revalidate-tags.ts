import type {
	SubscriberArgs,
	SubscriberConfig,
} from '@medusajs/framework/subscribers';
import {
	Modules,
	ProductEvents,
	ProductWorkflowEvents,
} from '@medusajs/framework/utils';
import { STOREFRONT_MODULE } from '../../modules/storefront';
import type StorefrontModuleService from '../../modules/storefront/service';
import buildNavMenuWorkflow from '../../workflows/nav-menu';

export default async function revalidateTagsProductsHandler({
	event: { data },
	container,
}: SubscriberArgs<{ id: string }>) {
	const tags = ['products', 'custom-products', 'products-labels'];
	const storefrontService: StorefrontModuleService =
		container.resolve(STOREFRONT_MODULE);
	await storefrontService.revalidateTags(tags);

	buildNavMenuWorkflow(container).run({
		input: {
			isCached: true,
		},
	});
}

export const config: SubscriberConfig = {
	event: [
		ProductWorkflowEvents.CREATED,
		ProductWorkflowEvents.UPDATED,
		ProductWorkflowEvents.DELETED,
		ProductEvents.PRODUCT_UPDATED,
		ProductEvents.PRODUCT_CREATED,
		ProductEvents.PRODUCT_DELETED,
	],
	context: {
		subscriberId: 'revalidate-tags-products',
	},
};

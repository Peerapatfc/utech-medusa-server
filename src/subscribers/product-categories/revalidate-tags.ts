import type {
	SubscriberArgs,
	SubscriberConfig,
} from '@medusajs/framework/subscribers';
import { ProductCategoryWorkflowEvents } from '@medusajs/framework/utils';
import { STOREFRONT_MODULE } from '../../modules/storefront';
import type StorefrontModuleService from '../../modules/storefront/service';
import { ProductEvents } from '@medusajs/utils';
import buildNavMenuWorkflow from '../../workflows/nav-menu';

export default async function revalidateTagsCategoriesHandler({
	event: { data },
	container,
}: SubscriberArgs<{ id: string }>) {
	const tags = ['categories', 'custom-categories'];
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
		ProductCategoryWorkflowEvents.CREATED,
		ProductCategoryWorkflowEvents.UPDATED,
		ProductCategoryWorkflowEvents.DELETED,
		ProductEvents.PRODUCT_CATEGORY_CREATED,
		ProductEvents.PRODUCT_CATEGORY_UPDATED,
		ProductEvents.PRODUCT_CATEGORY_DELETED,
	],
	context: {
		subscriberId: 'revalidate-tags-categories',
	},
};

import type {
	SubscriberArgs,
	SubscriberConfig,
} from '@medusajs/framework/subscribers';
import { ProductCollectionWorkflowEvents } from '@medusajs/framework/utils';
import { STOREFRONT_MODULE } from '../../modules/storefront';
import type StorefrontModuleService from '../../modules/storefront/service';
import buildNavMenuWorkflow from '../../workflows/nav-menu';

export default async function revalidateTagsCollectionsHandler({
	event: { data },
	container,
}: SubscriberArgs<{ id: string }>) {
	const tags = ['collections'];

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
		ProductCollectionWorkflowEvents.CREATED,
		ProductCollectionWorkflowEvents.UPDATED,
		ProductCollectionWorkflowEvents.DELETED,
	],
	context: {
		subscriberId: 'revalidate-tags-collections',
	},
};

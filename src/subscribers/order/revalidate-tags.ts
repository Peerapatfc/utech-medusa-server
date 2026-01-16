import type {
	SubscriberArgs,
	SubscriberConfig,
} from '@medusajs/framework/subscribers';
import { STOREFRONT_MODULE } from '../../modules/storefront';
import type StorefrontModuleService from '../../modules/storefront/service';

export default async function revalidateTagsOrderPlacedHandler({
	event: { data },
	container,
}: SubscriberArgs<{ id: string }>) {
	const tags = ['products', 'custom-products', 'coupons'];

	const storefrontService: StorefrontModuleService =
		container.resolve(STOREFRONT_MODULE);
	await storefrontService.revalidateTags(tags);
}

export const config: SubscriberConfig = {
	event: ['order.placed'],
	context: {
		subscriberId: 'revalidate-tags-order.placed',
	},
};

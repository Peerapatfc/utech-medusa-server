import type {
	SubscriberArgs,
	SubscriberConfig,
} from '@medusajs/framework/subscribers';
import { STOREFRONT_MODULE } from '../../modules/storefront';
import type StorefrontModuleService from '../../modules/storefront/service';

export default async function revalidateTagsFlashSaleHandler({
	event,
	container,
}: SubscriberArgs<{ id: string }>) {
	const tags = ['flash-sales', 'products', 'custom-products'];

	const storefrontService: StorefrontModuleService =
		container.resolve(STOREFRONT_MODULE);
	await storefrontService.revalidateTags(tags);
}

export const config: SubscriberConfig = {
	event: 'flash-sale.created',
	context: {
		subscriberId: 'flash-sale-created-revalidate-tags',
	},
};

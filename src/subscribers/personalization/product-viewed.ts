import type { SubscriberConfig } from '@medusajs/framework/subscribers';
import { PERSONALIZATION_MODULE } from '../../modules/personalization';
import PersonalizationModuleService from '../../modules/personalization/service';

export default async function productViewedEventHandler({ event, container }) {
	const data = event.data;

	const filtersViewCount = {
		product_id: data.product_id,
	};

	if (data.customer_id) {
		Object.assign(filtersViewCount, { customer_id: data.customer_id });
	} else if (data.guest_id) {
		Object.assign(filtersViewCount, { guest_id: data.guest_id });
	}

	const personalizationService: PersonalizationModuleService =
		container.resolve(PERSONALIZATION_MODULE);
	const existing = await personalizationService
		.listProductViewCounts(filtersViewCount)
		.then((res) => res[0]);

	if (existing) {
		await personalizationService.updateProductViewCounts({
			id: existing.id,
			view_count: existing.view_count + 1,
		});
	} else {
		await personalizationService.createProductViewCounts({
			product_id: data.product_id,
			customer_id: data.customer_id || null,
			guest_id: data.guest_id || null,
			view_count: 1,
		});
	}
}

export const config: SubscriberConfig = {
	event: 'product.viewed',
	context: {
		subscriberId: 'product-viewed-event',
	},
};

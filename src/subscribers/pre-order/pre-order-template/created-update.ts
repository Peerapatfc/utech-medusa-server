import type { PreOrderTemplate } from '@customTypes/pre-order';
import type { SubscriberArgs, SubscriberConfig } from '@medusajs/framework';
import type PreOrderStrapiService from '../../../modules/strapi/pre-order/service';
import { PRE_ORDER_STRAPI_MODULE } from '../../../modules/strapi/pre-order';
import type PreOrderService from '../../../modules/pre-order/service';
import { PRE_ORDER_SERVICE } from '../../../modules/pre-order';

export default async function preOrderTemplateCreateUpdatedHandler({
	event,
	container,
}: SubscriberArgs<PreOrderTemplate>) {
	const data = event.data;

	const preOrderStrapiService: PreOrderStrapiService = container.resolve(
		PRE_ORDER_STRAPI_MODULE,
	);
	const preOrderService: PreOrderService = container.resolve(PRE_ORDER_SERVICE);

	const preOrderStrapi = await preOrderStrapiService.getPreOrderByMedusaId(
		data.id,
	);
	if (!preOrderStrapi) {
		const created = await preOrderStrapiService.createPreOrder({
			name: data.name_en,
			medusa_id: data.id,
		});
		await preOrderService.updatePreOrderTemplates({
			id: data.id,
			metadata: {
				strapi_id: created.id,
			},
		});
	}

	const strapiHomeDeliveryById =
		await preOrderStrapiService.getHomeDeliveryTermsByMedusaId(data.id);
	if (!strapiHomeDeliveryById) {
		const createdHomeDelivery = await preOrderStrapiService.createPickupTerm({
			name: data.name_en,
			terms_type: 'Home Delivery',
			pickup_slug: 'home-delivery',
			medusa_pre_orer_campaigne_id: data.id,
		});
		await preOrderService.updatePreOrderTemplates({
			id: data.id,
			metadata: {
				strapi_home_delivery_id: createdHomeDelivery.id,
			},
		});
	}

	const strapiInStorePickupById =
		await preOrderStrapiService.getInStorePickupTermsByMedusaId(data.id);
	if (!strapiInStorePickupById) {
		const createdInStorePickup = await preOrderStrapiService.createPickupTerm({
			name: data.name_en,
			terms_type: 'In-Store Pickup',
			pickup_slug: 'in-store-pickup',
			medusa_pre_orer_campaigne_id: data.id,
		});
		await preOrderService.updatePreOrderTemplates({
			id: data.id,
			metadata: {
				strapi_in_store_pickup_id: createdInStorePickup.id,
			},
		});
	}
}

export const config: SubscriberConfig = {
	event: ['pre_order_template.created', 'pre_order_template.updated'],
};

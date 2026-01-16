import StrapiBaseService from '../base';
import type {
	PickupShippingTermStrapiData,
	PreOrderStrapi,
	StrapiResponse,
	UTechMap,
} from './type';

export default class PreOrderStrapiService extends StrapiBaseService {
	async getPreOrderByMedusaId(
		medusaId: string,
	): Promise<StrapiResponse<PreOrderStrapi | null>> {
		const item = await this.$http
			.get('/pre-order-campaigns', {
				params: {
					'filters[medusa_id][$eq]': medusaId,
					populate: '*',
				},
			})
			.then((response) => {
				return response.data?.data[0] || null;
			})
			.catch((error) => {
				this.logger.error(`get pre-order  error: ${error?.message}`);
			});

		return item;
	}

	async createPreOrder(data: {
		name: string;
		medusa_id: string;
	}) {
		const created = await this.$http
			.post('/pre-order-campaigns', {
				data,
			})
			.then((response) => response.data?.data)
			.catch((error) => {
				this.logger.error(`create strapi  error: ${error?.message}`);
			});

		return created as PreOrderStrapi;
	}

	async getPickupTermByMedusaId(
		medusaId: string,
	): Promise<PickupShippingTermStrapiData | null> {
		const item = await this.$http
			.get('/pre-order-pickup-and-shipping-terms', {
				params: {
					'filters[medusa_pre_orer_campaigne_id][$eq]': medusaId,
					'filters[pickup_slug][$eq]': 'in-store-pickup',
					populate: '*',
				},
			})
			.then((response) => response.data?.data[0] || null)
			.catch((error) => {
				this.logger.error(`get strapi  error: ${error?.message}`);
			});

		return item;
	}

	async getHomeDeliveryTermsByMedusaId(
		medusaId: string,
	): Promise<PickupShippingTermStrapiData | null> {
		const item = await this.$http
			.get('/pre-order-pickup-and-shipping-terms', {
				params: {
					'filters[medusa_pre_orer_campaigne_id][$eq]': medusaId,
					'filters[pickup_slug][$eq]': 'home-delivery',
					populate: '*',
				},
			})
			.then((response) => response.data?.data[0] || null)
			.catch((error) => {
				this.logger.error(`get strapi  error: ${error?.message}`);
			});

		return item;
	}

	async getInStorePickupTermsByMedusaId(
		medusaId: string,
	): Promise<PickupShippingTermStrapiData | null> {
		const item = await this.$http
			.get('/pre-order-pickup-and-shipping-terms', {
				params: {
					'filters[medusa_pre_orer_campaigne_id][$eq]': medusaId,
					'filters[pickup_slug][$eq]': 'in-store-pickup',
					populate: '*',
				},
			})
			.then((response) => response.data?.data[0] || null)
			.catch((error) => {
				this.logger.error(`get strapi  error: ${error?.message}`);
			});

		return item;
	}

	async createPickupTerm(data: {
		name: string;
		terms_type: string;
		pickup_slug: string;
		medusa_pre_orer_campaigne_id: string;
	}) {
		const created = await this.$http
			.post('/pre-order-pickup-and-shipping-terms', {
				data,
			})
			.then((response) => response.data?.data)
			.catch((error) => {
				this.logger.error(`create strapi  error: ${error?.message}`);
			});

		return created as PickupShippingTermStrapiData;
	}

	async getUTechMap(): Promise<StrapiResponse<UTechMap | null>> {
		return this.$http
			.get('/u-tech-map', {
				params: {
					populate: '*',
				},
			})
			.then((response) => response.data?.data || null)
			.catch((error) => {
				this.logger.error(`get strapi  error: ${error?.message}`);
			});
	}
}

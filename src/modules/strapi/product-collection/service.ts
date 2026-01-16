import StrapiBaseService from '../base';
import type { Collection, CollectionStrapi } from '../type';

export default class CollectionStrapiService extends StrapiBaseService {
	async createCollection(collection: Collection): Promise<CollectionStrapi> {
		try {
			const response = await this.$http.post('/product-collections', {
				data: collection,
			});
			return response.data?.data;
		} catch (error) {
			this.handleHttpError(
				'create strapi collection',
				error.response.data.error,
			);
			throw error;
		}
	}

	async getCollectionByMedusaId(medusaId: string): Promise<CollectionStrapi> {
		try {
			const response = await this.$http.get(
				`/product-collections?filters[medusa_id][$eq]=${medusaId}&populate=*`,
			);
			return response.data?.data?.[0];
		} catch (error) {
			this.handleHttpError('get strapi collection', error.response.data.error);
			return null;
		}
	}

	async updateCollection(
		id: number,
		collection: Collection,
	): Promise<CollectionStrapi> {
		try {
			const response = await this.$http.put(`/product-collections/${id}`, {
				data: collection,
			});
			return response.data?.data;
		} catch (error) {
			this.handleHttpError('update strapi collection', error);
			return null;
		}
	}

	async deleteCollectionByMedusaId(medusa_id: string): Promise<void> {
		try {
			const lists = await this.getListAllByMedusaId(medusa_id);
			lists.map(async (list) => {
				await this.$http.delete(`/product-collections/${list.id}`);
			});
		} catch (error) {
			this.handleHttpError('delete strapi collection', error);
		}
	}

	async getListAllByMedusaId(medusa_id: string): Promise<CollectionStrapi[]> {
		try {
			const url = '/product-collections';
			const params = new URLSearchParams({
				'filters[medusa_id][$eq]': medusa_id,
				populate: '*',
				'locale[0]': 'th',
				'locale[1]': 'en',
			});
			const response = await this.$http.get(`${url}?${params}`);
			const data = response?.data?.data;

			if (!data) {
				return null;
			}

			return data;
		} catch (error) {
			this.handleHttpError('Failed to get collection', error);
			return null;
		}
	}

	async getListAll(locale: string): Promise<CollectionStrapi[]> {
		try {
			const url = '/product-collections';
			const params = new URLSearchParams({
				locale,
				populate: '*',
			});

			const response = await this.$http.get(`${url}?${params}`);
			const data = response?.data?.data;

			if (!data) {
				return null;
			}

			return data;
		} catch (error) {
			this.handleHttpError('Failed to get collection', error);
			return null;
		}
	}

	private handleHttpError(operation: string, error): void {
		this.logger.error(`${operation} error`, error);
		if (error.response) {
			this.logger.error(`Status: ${error.response.status}`);
			this.logger.error(`Data: ${JSON.stringify(error.response.data)}`);
		}
	}
}

import StrapiBaseService from '../base';
import type { MiniBanner } from '../type';

class MiniBannerService extends StrapiBaseService {
	async getListAll(
		pageSize = 10,
		sort = 'rank:asc',
	): Promise<MiniBanner | null> {
		try {
			const url = '/mini-banners';
			const params = new URLSearchParams({
				populate: '*',
				sort: sort,
				'pagination[pageSize]': pageSize.toString(),
			});

			const response = await this.$http.get(`${url}?${params}`);
			const data = response?.data?.data;

			if (!data) {
				return null;
			}

			return data.map(this.transformItem);
		} catch (error) {
			this.logger.error('Failed to get mini banner', error);
			return null;
		}
	}
}

export default MiniBannerService;

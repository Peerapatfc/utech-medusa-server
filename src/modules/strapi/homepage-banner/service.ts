import StrapiBaseService from '../base';
import type { HomepageBanner } from '../type';

class HomepageBannerService extends StrapiBaseService {
	async getListAll(
		pageSize = 10,
		sort = 'rank:asc',
	): Promise<HomepageBanner | null> {
		try {
			const url = '/homepage-banners';
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
			this.logger.error('Failed to get homepage banner', error);
			return null;
		}
	}
}

export default HomepageBannerService;

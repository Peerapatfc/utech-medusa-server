
import StrapiBaseService from "../base"
import type { BrandBanner } from "../type"

class BrandBannerService extends StrapiBaseService {

    async getListAll(): Promise<BrandBanner[]> {
        try {
            const url = '/brand-banners';
            const params = new URLSearchParams({
                'populate': '*',
                'sort': 'rank:asc',
            });

            const response = await this.$http.get(`${url}?${params}`);
            const data = response?.data?.data;

            if (!data) {
                return [];
            }

            return data.map(this.transformItem);

        } catch (error) {
            this.logger.error(`Failed to get brand banner, ${error.message}`, error);
            return [];
        }
    }
}

export default BrandBannerService   
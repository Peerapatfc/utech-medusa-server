import type { Logger } from '@medusajs/framework/types';
import axios, { type AxiosInstance } from 'axios';

export default class StorefrontModuleService {
	protected readonly $http: AxiosInstance;
	protected readonly logger: Logger;
	constructor(container) {
		this.$http = this.createAxiosInstance();
		this.logger = container.logger;
	}

	private createAxiosInstance(): AxiosInstance {
		const { MEDUSA_FRONTEND_URL, MEDUSA_FRONTEND_REVALIDATE_SECRET } =
			process.env;

		if (!MEDUSA_FRONTEND_URL || !MEDUSA_FRONTEND_REVALIDATE_SECRET) {
			throw new Error(
				'MEDUSA_FRONTEND_URL and MEDUSA_FRONTEND_REVALIDATE_SECRET must be defined in environment variables',
			);
		}

		return axios.create({
			baseURL: `${MEDUSA_FRONTEND_URL}/api`,
			headers: {
				'x-revalidate-api-key': MEDUSA_FRONTEND_REVALIDATE_SECRET,
			},
		});
	}

	revalidateTag(tag: string) {
		return this.$http
			.get('/revalidate', {
				params: { tag },
			})
			.then((response) => {
				this.logger.info(`Revalidated tag: ${tag}`);
				return response.data;
			})
			.catch((err) => {
				this.logger.error(
					`Failed to revalidate tag: ${tag}, err: ${err?.message}`,
				);
				return null;
			});
	}

	revalidateTags(tags: string[]) {
		return this.$http
			.post('/revalidate', {
				tags,
			})
			.then((response) => {
				this.logger.info(`Revalidated tags: ${tags.join(', ')}`);
				return response.data;
			})
			.catch((err) => {
				this.logger.error(
					`Failed to revalidate tags: ${tags.join(', ')}, err: ${err?.message}`,
				);
				return null;
			});
	}
}

import axios, { type AxiosInstance } from 'axios';
import type { StrapiRawData, StrapiImage } from './type';
import type { Logger } from '@medusajs/framework/types';

export default class StrapiBaseService {
	protected readonly $http: AxiosInstance;
	protected readonly logger: Logger;
	constructor(container) {
		this.$http = this.createAxiosInstance();
		this.logger = container.logger;
	}

	private createAxiosInstance(): AxiosInstance {
		const { STRAPI_URL, STRAPI_SECRET } = process.env;

		if (!STRAPI_URL || !STRAPI_SECRET) {
			throw new Error(
				'STRAPI_URL and STRAPI_SECRET must be defined in environment variables',
			);
		}

		return axios.create({
			baseURL: `${STRAPI_URL}/api`,
			headers: {
				Authorization: `Bearer ${STRAPI_SECRET}`,
			},
		});
	}

	protected transformItem(item: StrapiRawData): Record<string, unknown> {
		const { image, mobile_image, ...otherAttributes } = item.attributes;
		const baseTransform = {
			id: item.id,
			...otherAttributes,
		};

		if (!image) {
			return baseTransform;
		}

		const desktopImage = image as StrapiImage;
		const mobileImage = mobile_image as StrapiImage;

		const hasMobileImage = mobileImage.data?.attributes?.url;

		const resolveMobileImage = hasMobileImage ? mobileImage : desktopImage;

		return {
			...baseTransform,
			desktop_image: {
				url: desktopImage.data?.attributes?.url,
				width: desktopImage.data?.attributes?.width,
				height: desktopImage.data?.attributes?.height,
			},
			mobile_image: {
				url: resolveMobileImage.data?.attributes?.url,
				width: resolveMobileImage.data?.attributes?.width,
				height: resolveMobileImage.data?.attributes?.height,
			},
		};
	}
}

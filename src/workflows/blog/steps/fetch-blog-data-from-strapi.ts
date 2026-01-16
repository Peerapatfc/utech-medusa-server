import { StepResponse, createStep } from '@medusajs/framework/workflows-sdk';
import axios from 'axios';
import { endOfDay, formatISO, startOfDay } from 'date-fns';

// Strapi types
export type StrapiBlog = {
	id: number;
	attributes: {
		title: string;
		createdAt: string;
		publishedAt: string;
		views: number;
		blog_author?: { data?: { attributes?: { name: string } } };
		blog_categories?: { data: { attributes: { name: string } }[] };
		related_products?: { data: { attributes: { title: string } }[] };
	};
};

export type StrapiResponse = {
	data: StrapiBlog[];
};

export type FetchBlogDataFromStrapiStepInput = {
	start_date: string;
	end_date: string;
	page_size?: number;
};

export const fetchBlogDataFromStrapiStep = createStep(
	'fetch-blog-data-from-strapi-step',
	async (
		input: FetchBlogDataFromStrapiStepInput,
		{ container },
	): Promise<StepResponse<StrapiBlog[]>> => {
		const { start_date, end_date, page_size } = input;

		const strapiClient = axios.create({
			baseURL: `${process.env.STRAPI_URL}/api`,
			headers: { Authorization: `Bearer ${process.env.STRAPI_SECRET}` },
		});

		const params = new URLSearchParams({
			populate: 'blog_author,blog_categories,related_products',
			'pagination[pageSize]': page_size.toString(),
			sort: 'createdAt:desc',
			'filters[createdAt][$gte]': formatISO(startOfDay(new Date(start_date))),
			'filters[createdAt][$lte]': formatISO(endOfDay(new Date(end_date))),
		});

		try {
			const response = await strapiClient.get<StrapiResponse>(
				`/blogs?${params}`,
			);
			const blogs = response.data.data;

			return new StepResponse(blogs);
		} catch (error) {
			console.error('Error fetching blog data from Strapi:', error);
			throw new Error(`Failed to fetch blog data: ${error.message}`);
		}
	},
);

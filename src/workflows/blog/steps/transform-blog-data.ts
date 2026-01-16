import { StepResponse, createStep } from '@medusajs/framework/workflows-sdk';
import type { StrapiBlog } from './fetch-blog-data-from-strapi';

export type BlogData = {
	id: number;
	title: string;
	createdAt: string;
	publishedAt: string;
	views: number;
	author: string;
	categories: string[];
	relatedProducts: string[];
};

export type TransformBlogDataStepInput = {
	strapiBlogs: StrapiBlog[];
};

export const transformBlogDataStep = createStep(
	'transform-blog-data-step',
	async (
		input: TransformBlogDataStepInput,
	): Promise<StepResponse<BlogData[]>> => {
		const transformedBlogs = input.strapiBlogs.map((blog) => ({
			id: blog.id,
			title: blog.attributes?.title || '',
			createdAt: blog.attributes?.createdAt || '',
			publishedAt: blog.attributes?.publishedAt || '',
			views: blog.attributes?.views || 0,
			author: blog.attributes?.blog_author?.data?.attributes?.name || '',
			categories:
				blog.attributes?.blog_categories?.data
					?.map((cat) => cat.attributes?.name)
					?.filter(Boolean) || [],
			relatedProducts:
				blog.attributes?.related_products?.data
					?.map((prod) => prod.attributes?.title)
					?.filter(Boolean) || [],
		}));

		return new StepResponse(transformedBlogs);
	},
);

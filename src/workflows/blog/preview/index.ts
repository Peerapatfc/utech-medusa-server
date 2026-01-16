import {
	WorkflowResponse,
	createWorkflow,
} from '@medusajs/framework/workflows-sdk';
import { fetchBlogDataFromStrapiStep } from '../steps/fetch-blog-data-from-strapi';
import { transformBlogDataStep } from '../steps/transform-blog-data';

export type BlogPreviewInput = {
	start_date: string;
	end_date: string;
};

const PREVIEW_PAGE_SIZE = 5000;

export const getBlogPreviewWorkflow = createWorkflow(
	'get-blog-preview-workflow',
	(input: BlogPreviewInput) => {
		// Step 1: Fetch all blog data from Strapi for the date range
		const strapiResult = fetchBlogDataFromStrapiStep({
			start_date: input.start_date,
			end_date: input.end_date,
			page_size: PREVIEW_PAGE_SIZE,
		});

		// Step 2: Transform for preview
		const transformedBlogs = transformBlogDataStep({
			strapiBlogs: strapiResult,
		});

		return new WorkflowResponse(transformedBlogs);
	},
);

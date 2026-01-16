import {
	WorkflowResponse,
	createWorkflow,
} from '@medusajs/framework/workflows-sdk';
import { fetchBlogDataFromStrapiStep } from '../steps/fetch-blog-data-from-strapi';
import { generateBlogCsvStep } from '../steps/generate-blog-csv';
import { transformBlogDataStep } from '../steps/transform-blog-data';

export type BlogExportInput = {
	start_date: string;
	end_date: string;
};

const PAGE_SIZE = 5000;

export const getBlogExportWorkflow = createWorkflow(
	'get-blog-export-workflow',
	(input: BlogExportInput) => {
		// Step 1: Fetch blog data from Strapi
		const strapiBlogs = fetchBlogDataFromStrapiStep({
			start_date: input.start_date,
			end_date: input.end_date,
			page_size: PAGE_SIZE,
		});

		// Step 2: Transform for export
		const transformedBlogs = transformBlogDataStep({
			strapiBlogs: strapiBlogs,
		});

		// Step 3: Generate CSV content
		const csvData = generateBlogCsvStep({
			blogs: transformedBlogs,
		});

		return new WorkflowResponse(csvData);
	},
);

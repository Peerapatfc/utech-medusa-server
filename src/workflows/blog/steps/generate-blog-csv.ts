import { StepResponse, createStep } from '@medusajs/framework/workflows-sdk';
import { stringify } from 'csv-stringify/sync';
import { formatInTimeZone } from 'date-fns-tz';
import type { BlogData } from './transform-blog-data';

export type GenerateBlogCsvStepInput = {
	blogs: BlogData[];
};

export type CsvOutput = {
	csvContent: string;
	filename: string;
};

const formatDate = (date: string) =>
	formatInTimeZone(new Date(date), 'Asia/Bangkok', 'yyyy-MM-dd HH:mm');

export const generateBlogCsvStep = createStep(
	'generate-blog-csv-step',
	async (input: GenerateBlogCsvStepInput): Promise<StepResponse<CsvOutput>> => {
		const { blogs } = input;

		const csvData = blogs.map((blog) => [
			formatDate(blog.createdAt),
			blog.publishedAt ? formatDate(blog.publishedAt) : '',
			blog.title,
			blog.views,
			blog.author,
			blog.categories.join(', '),
			blog.relatedProducts.join(', '),
		]);

		const csvContent = stringify(csvData, {
			header: true,
			columns: [
				'Created Date',
				'Published Date',
				'Blog Name',
				'View Counts',
				'Blog Author',
				'Blog Category',
				'Related Product',
			],
		});

		const filename = `blog-performance-${formatInTimeZone(new Date(), 'Asia/Bangkok', 'yyyy-MM-dd_HH-mm')}.csv`;
		return new StepResponse({ csvContent, filename });
	},
);

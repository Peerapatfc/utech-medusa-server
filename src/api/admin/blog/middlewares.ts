import { validateAndTransformQuery } from '@medusajs/framework';
import type { MiddlewareRoute } from '@medusajs/framework/http';
import { BlogPerformanceQueryParams } from './validators';

export const adminBlogMiddlewares: MiddlewareRoute[] = [
	{
		method: ['GET'],
		matcher: '/admin/blog/export',
		middlewares: [validateAndTransformQuery(BlogPerformanceQueryParams, {})],
	},
	{
		method: ['GET'],
		matcher: '/admin/blog/preview',
		middlewares: [validateAndTransformQuery(BlogPerformanceQueryParams, {})],
	},
];

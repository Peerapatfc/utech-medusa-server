import {
	validateAndTransformBody,
	validateAndTransformQuery,
} from '@medusajs/framework';
import type { MiddlewareRoute } from '@medusajs/framework/http';
import * as QueryConfig from './query-config';
import {
	AdminGetProductAttributeCategoriesParams,
	AdminPostProductAttributeCategoriesReq,
	AdminPutProductAttributeCategoriesBody,
} from './validators';

export const adminProductAttributeCategoriesMiddlewares: MiddlewareRoute[] = [
	{
		method: ['GET'],
		matcher: '/admin/product-attribute-categories',
		middlewares: [
			validateAndTransformQuery(
				AdminGetProductAttributeCategoriesParams,
				QueryConfig.listTransformQueryConfig,
			),
		],
	},
	{
		method: ['POST'],
		matcher: '/admin/product-attribute-categories',
		middlewares: [
			validateAndTransformBody(AdminPostProductAttributeCategoriesReq),
		],
	},
	{
		method: ['PUT'],
		matcher: '/admin/product-attribute-categories',
		middlewares: [
			validateAndTransformBody(AdminPutProductAttributeCategoriesBody),
		],
	},
];

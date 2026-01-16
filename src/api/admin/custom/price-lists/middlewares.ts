import { validateAndTransformQuery } from '@medusajs/framework';
import type { MiddlewareRoute } from '@medusajs/framework/http';
import * as QueryConfig from './query-config';
import { AdminGetPriceListsParams } from './validators';

export const adminPriceListsCustomRoutesMiddlewares: MiddlewareRoute[] = [
	{
		method: ['GET'],
		matcher: '/admin/custom/price-lists',
		middlewares: [
			validateAndTransformQuery(
				AdminGetPriceListsParams,
				QueryConfig.listPriceListQueryConfig,
			),
		],
	},
];

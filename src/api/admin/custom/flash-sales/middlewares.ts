import { validateAndTransformQuery } from '@medusajs/framework';
import type { MiddlewareRoute } from '@medusajs/framework/http';
import * as QueryConfig from './query-config';
import { AdminGetPriceListsParams } from './validators';

export const adminFlashSaleRoutesMiddlewares: MiddlewareRoute[] = [
	{
		method: ['GET'],
		matcher: '/admin/custom/flash-sales',
		middlewares: [
			validateAndTransformQuery(
				AdminGetPriceListsParams,
				QueryConfig.listPriceListQueryConfig,
			),
		],
	},
];

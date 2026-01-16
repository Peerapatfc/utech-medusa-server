import {
	validateAndTransformBody,
	validateAndTransformQuery,
} from '@medusajs/framework';
import type { MiddlewareRoute } from '@medusajs/framework/http';
import * as QueryConfig from './query-config';
import {
	AdminGetStoreNotificationParams,
	AdminGetStoreNotificationsParams,
} from './validators';

// Note: If you encounter TypeScript errors in the route file when using validatedQuery properties,
// you may need to use type assertions (e.g., `req.validatedQuery.property as string`)
// due to how the middleware framework is typed.

export const adminStoreNotificationRoutesMiddlewares: MiddlewareRoute[] = [
	{
		method: ['GET'],
		matcher: '/admin/store-notifications',
		middlewares: [
			validateAndTransformQuery(
				AdminGetStoreNotificationsParams,
				QueryConfig.listTransformQueryConfig,
			),
		],
	},
	{
		method: ['GET'],
		matcher: '/admin/store-notifications/:id',
		middlewares: [
			validateAndTransformQuery(
				AdminGetStoreNotificationParams,
				QueryConfig.retrieveTransformQueryConfig,
			),
		],
	},
];

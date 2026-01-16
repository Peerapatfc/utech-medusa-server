import {
	type MiddlewareRoute,
	authenticate,
	validateAndTransformBody,
	validateAndTransformQuery,
} from '@medusajs/framework';
import { listTransformQueryConfig } from './query-config';
import {
	StoreBulkReadNotificationsBodySchema,
	StoreGetNotificationsParamsSchema,
} from './validator';

export const storeNotificationRoutesMiddlewares: MiddlewareRoute[] = [
	{
		method: ['ALL'],
		matcher: '/store/notifications/*',
		middlewares: [authenticate('customer', ['session', 'bearer'])],
	},
	{
		method: ['GET'],
		matcher: '/store/notifications',
		middlewares: [
			authenticate('customer', ['session', 'bearer']),
			validateAndTransformQuery(
				StoreGetNotificationsParamsSchema,
				listTransformQueryConfig,
			),
		],
	},
	{
		method: ['POST'],
		matcher: '/store/notifications/read',
		middlewares: [
			authenticate('customer', ['session', 'bearer']),
			validateAndTransformBody(StoreBulkReadNotificationsBodySchema),
		],
	},
	{
		method: ['GET'],
		matcher: '/store/notifications/unread',
		middlewares: [authenticate('customer', ['session', 'bearer'])],
	},
];

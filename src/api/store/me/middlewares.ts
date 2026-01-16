import { authenticate, type MiddlewareRoute } from '@medusajs/framework';

export const storeMeRoutesMiddlewares: MiddlewareRoute[] = [
	{
		method: ['ALL'],
		matcher: '/store/me/*',
		middlewares: [authenticate('customer', ['session', 'bearer'])],
	},
];

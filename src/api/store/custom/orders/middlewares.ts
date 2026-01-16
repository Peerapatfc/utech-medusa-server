import { authenticate, type MiddlewareRoute } from '@medusajs/framework';

export const storeCustomOrdertRoutesMiddlewares: MiddlewareRoute[] = [
	{
		method: ['GET'],
		matcher: '/store/custom/orders/:id/retry-payment',
		middlewares: [authenticate('customer', ['session', 'bearer'])],
	},
	{
		methods: ['GET'],
		matcher: '/store/custom/orders/:id/fulfillment-labels',
		middlewares: [authenticate('customer', ['session', 'bearer'])],
	},
];

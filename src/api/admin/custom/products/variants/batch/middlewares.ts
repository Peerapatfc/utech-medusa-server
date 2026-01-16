import {
	type MiddlewareRoute,
	validateAndTransformBody,
} from '@medusajs/framework';
import { AdminBatchUpdateProductVariantsSchema } from './validators';

export const productsVariantsBatch = validateAndTransformBody(
	AdminBatchUpdateProductVariantsSchema,
);

export const adminProductsVariantsBatchMiddlewares: MiddlewareRoute[] = [
	{
		method: ['POST'],
		matcher: '/admin/custom/products/variants/batch',
		middlewares: [
			validateAndTransformBody(AdminBatchUpdateProductVariantsSchema),
		],
	},
];

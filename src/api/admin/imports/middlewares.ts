import { validateAndTransformBody } from '@medusajs/framework';
import type { MiddlewareRoute } from '@medusajs/framework/http';

import { transformQueryToPagitation } from './helper';
import { AdminValidateImportSchema } from './validate-reports/validators';
import { AdminImportSchema } from './validators';

export const adminImportRoutesMiddlewares: MiddlewareRoute[] = [
	{
		method: ['POST'],
		matcher: '/admin/imports',
		middlewares: [validateAndTransformBody(AdminImportSchema)],
	},
	{
		method: ['GET'],
		matcher: '/admin/imports',
		middlewares: [transformQueryToPagitation],
	},
	{
		method: ['POST'],
		matcher: '/admin/imports/validate-reports',
		middlewares: [validateAndTransformBody(AdminValidateImportSchema)],
	},
];

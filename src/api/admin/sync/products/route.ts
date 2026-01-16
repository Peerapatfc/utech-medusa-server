import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { ContainerRegistrationKeys } from '@medusajs/framework/utils';
import { syncProductsWorkflow } from '../../../../workflows/product/sync-products';

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
	const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER);

	try {
		syncProductsWorkflow(req.scope).run();

		res.status(200).json({
			message: 'Sync products completed',
		});
	} catch (error) {
		logger.error(error);
		res
			.status(500)
			.json({ message: error?.message || 'Internal server error' });
	}
};

import type { MedusaRequest, MedusaResponse } from '@medusajs/framework';
import type { ICustomerModuleService } from '@medusajs/framework/types';
import { Modules } from '@medusajs/framework/utils';

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
	const customerService: ICustomerModuleService = req.scope.resolve(
		Modules.CUSTOMER,
	);

	try {
		if (req.query.error) {
			throw new Error('Error from store route');
		}

		const customers = await customerService.listCustomers(
			{},
			{
				take: 2,
			},
		);

		res.status(200).json({
			message: 'Hello from store route',
			customers,
		});
		return;
	} catch (error) {
		res.status(500).json({
			error: error.message,
		});
	}
};

import type {
	MedusaResponse,
	AuthenticatedMedusaRequest,
} from '@medusajs/framework';
import {
	CustomerGroupCustomerDTO,
	CustomerGroupDTO,
	ICustomerModuleService,
} from '@medusajs/framework/types';
import { Modules } from '@medusajs/framework/utils';

interface CustomCustomerGroupCustomerDTO extends CustomerGroupCustomerDTO {
	customer_group: CustomerGroupDTO;
}

export const GET = async (
	req: AuthenticatedMedusaRequest,
	res: MedusaResponse,
) => {
	const customer_id = req.auth_context.actor_id;

	try {
		const customerService: ICustomerModuleService = req.scope.resolve(
			Modules.CUSTOMER,
		);
		const groups = await customerService.listCustomerGroupCustomers(
			{
				customer_id,
			},
			{
				relations: ['customer_group'],
			},
		);
		const result = groups.map((group: CustomCustomerGroupCustomerDTO) => ({
			...group.customer_group,
		}));
		res.status(200).json({
			groups: result,
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: error?.message || 'An error occurred',
		});
	}
};

import type { CustomPromotion } from '../../../../types/promotion';
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils';
import { createStep, StepResponse } from '@medusajs/framework/workflows-sdk';
import type { GetPromotionListWorkflowInput } from '../';
import { CustomerGroupName } from '../../../../types/customer-group';

const getPromotionsStep = createStep(
	'get-promotion-step',
	async (input: GetPromotionListWorkflowInput, { container }) => {
		const { customer_id } = input;
		const query = container.resolve(ContainerRegistrationKeys.QUERY);

		if (customer_id) {
			const customerService = container.resolve(Modules.CUSTOMER);
			const customer = await customerService.retrieveCustomer(customer_id, {
				relations: ['groups'],
			});
			const is_has_new_customer = customer.groups.some(
				(group) => group.name === CustomerGroupName.NEW_MEMBER,
			);
			if (!is_has_new_customer) {
				return new StepResponse({ promotions: [] });
			}
		}

		const { data: promotions } = (await query.graph({
			entity: 'promotion',
			fields: [
				'*',
				'promotion_detail.*',
				'campaign.*',
				'campaign.budget.*',
				'application_method.*',
				'rules.*',
				'rules.values.*',
			],
			filters: {
				is_automatic: false,
				//@ts-ignore
				type: 'standard',
				status: 'active',
			},
			pagination: {
				take: 1000,
				skip: 0,
			},
		})) as { data: CustomPromotion[] };
		return new StepResponse({ promotions });
	},
);

export default getPromotionsStep;

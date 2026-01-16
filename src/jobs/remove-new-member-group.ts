import type { MedusaContainer } from '@medusajs/framework/types';
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils';
import dayjs from 'dayjs';
import { isMoreThan30Days } from '../utils/date';
import { CustomerGroupName } from '../types/customer-group';

export default async function handlerRemoveNewMemberGroup(
	container: MedusaContainer,
) {
	if (process.env.NODE_ENV === 'development') {
		return;
	}

	const logger = container.resolve('logger');
	const customerModuleService = container.resolve(Modules.CUSTOMER);

	const query = container.resolve(ContainerRegistrationKeys.QUERY);
	const { data: customer_groups } = await query.graph({
		entity: 'customer_group',
		fields: ['*', 'customers.*'],
		filters: {
			name: CustomerGroupName.NEW_MEMBER,
		},
		pagination: {
			take: 1,
			skip: 0,
		},
	});
	const newMemberGroup = customer_groups[0];
	if (!newMemberGroup) {
		return;
	}

	for (const customer of newMemberGroup.customers) {
		if (
			!isMoreThan30Days(
				new Date(dayjs(customer.created_at).format('YYYY-MM-DD')),
			)
		) {
			continue;
		}

		await customerModuleService.removeCustomerFromGroup({
			customer_id: customer.id,
			customer_group_id: newMemberGroup.id,
		});

		logger.info(
			`Remove customer #${customer.id} from new member group has been successfully.`,
		);
	}
}

export const config = {
	name: 'remove-new-member-group',
	schedule: '0 0 * * *',
};

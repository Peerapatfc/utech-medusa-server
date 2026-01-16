import { CustomerGroupName } from '@customTypes/customer-group';
import type { SubscriberArgs, SubscriberConfig } from '@medusajs/framework';
import {
	ContainerRegistrationKeys,
	CustomerWorkflowEvents,
	Modules,
} from '@medusajs/framework/utils';

export default async function customerCreatedAddToGroup({
	event: { data },
	container,
}: SubscriberArgs<{ id: string }>) {
	const logger = container.resolve(ContainerRegistrationKeys.LOGGER);

	const customerId = data.id;
	const customerModuleService = container.resolve(Modules.CUSTOMER);

	const customer = await customerModuleService.retrieveCustomer(customerId);
	if (!customer.has_account) return;

	try {
		const customerGroups = await customerModuleService.listCustomerGroups({});

		const memberGroup = customerGroups.find(
			(group) => group.name === CustomerGroupName.MEMBER,
		);
		let memberGroupId: string = memberGroup?.id;

		if (!memberGroup) {
			const createMemberGroup =
				await customerModuleService.createCustomerGroups({
					name: CustomerGroupName.MEMBER,
				});

			memberGroupId = createMemberGroup.id;
		}

		await customerModuleService.addCustomerToGroup({
			customer_id: customerId,
			customer_group_id: memberGroupId,
		});

		const newMemberGroup = customerGroups.find(
			(group) => group.name === CustomerGroupName.NEW_MEMBER,
		);
		let newMemberGroupId: string = newMemberGroup?.id;

		if (!newMemberGroup) {
			const createNewMemberGroup =
				await customerModuleService.createCustomerGroups({
					name: CustomerGroupName.NEW_MEMBER,
				});

			newMemberGroupId = createNewMemberGroup.id;
		}

		await customerModuleService.addCustomerToGroup({
			customer_id: customerId,
			customer_group_id: newMemberGroupId,
		});
	} catch (error) {
		logger.error(error);
	}
}

export const config: SubscriberConfig = {
	event: CustomerWorkflowEvents.CREATED,
};

import type { ICustomerModuleService } from '@medusajs/framework/types';
import type { CustomerDTO, CustomerGroupDTO } from '@medusajs/framework/types';
import type { StoreNotification } from '../../../types/store-notification';

export interface ExtendedCustomerGroupDTO extends CustomerGroupDTO {
	customer_count?: number;
}

export interface EnrichedStoreNotification extends StoreNotification {
	customers?: CustomerDTO[];
	customer_groups?: ExtendedCustomerGroupDTO[];
}

export interface NotificationWithRecipients extends EnrichedStoreNotification {
	customer_ids?: string[];
	customer_group_ids?: string[];
}

export interface RecipientIds {
	customerIds: Set<string>;
	customerGroupIds: Set<string>;
}

export const collectRecipientIds = (
	notifications: NotificationWithRecipients[],
): RecipientIds => {
	const customerIds = new Set<string>();
	const customerGroupIds = new Set<string>();

	for (const notification of notifications) {
		if (notification.customer_ids) {
			for (const id of notification.customer_ids) {
				customerIds.add(id);
			}
		}
		if (notification.customer_group_ids) {
			for (const id of notification.customer_group_ids) {
				customerGroupIds.add(id);
			}
		}
	}

	return { customerIds, customerGroupIds };
};

export const enrichNotification = (
	notification: NotificationWithRecipients,
	customersMap: Map<string, CustomerDTO>,
	customerGroupsMap: Map<string, ExtendedCustomerGroupDTO>,
): EnrichedStoreNotification => {
	const enriched = { ...notification };

	if (notification.customer_ids) {
		enriched.customers = notification.customer_ids
			.map((id) => customersMap.get(id))
			.filter((customer): customer is CustomerDTO => customer !== undefined);
	}

	if (notification.customer_group_ids) {
		enriched.customer_groups = notification.customer_group_ids
			.map((id) => customerGroupsMap.get(id))
			.filter(
				(group): group is ExtendedCustomerGroupDTO => group !== undefined,
			);
	}

	return enriched;
};

export const fetchCustomers = async (
	customerService: ICustomerModuleService,
	customerIds: Set<string>,
): Promise<Map<string, CustomerDTO>> => {
	if (customerIds.size === 0) return new Map();

	const [customers] = await customerService.listAndCountCustomers(
		{ id: Array.from(customerIds) },
		{ select: ['id', 'email', 'first_name', 'last_name', 'has_account'] },
	);

	return new Map(customers.map((customer) => [customer.id, customer]));
};

export const fetchCustomerGroups = async (
	customerService: ICustomerModuleService,
	customerGroupIds: Set<string>,
): Promise<Map<string, ExtendedCustomerGroupDTO>> => {
	if (customerGroupIds.size === 0) return new Map();

	const [customerGroups] = await customerService.listAndCountCustomerGroups(
		{ id: Array.from(customerGroupIds) },
		{ select: ['id', 'name', 'customers.id'], relations: ['customers'] },
	);

	return new Map(
		customerGroups.map((group) => {
			const extendedGroup = group as ExtendedCustomerGroupDTO;
			extendedGroup.customer_count = group.customers.length;
			extendedGroup.customers = undefined;
			return [group.id, extendedGroup];
		}),
	);
};

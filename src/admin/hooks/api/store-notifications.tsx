import type { StoreNotification } from '@customTypes/store-notification';
import type { BroadCastsCreateSchemaType } from '../../routes/broadcasts/modules/broadcasts-create/components/broadcasts-create-form/schema';
import type { CustomerDTO, CustomerGroupDTO } from '@medusajs/framework/types';

// Extended StoreNotification type with customer data
interface EnrichedStoreNotification extends StoreNotification {
	customers?: CustomerDTO[];
	customer_groups?: CustomerGroupDTO[];
}

export const getStoreNotificationLists = async (searchQuery: string) => {
	return await fetch(`/admin/store-notifications/?${searchQuery}`, {
		credentials: 'include',
		headers: { 'Content-Type': 'application/json' },
		method: 'GET',
	}).then((res) => res.json());
};

export const deleteStoreNotificationById = async (id: string) => {
	return await fetch(`/admin/store-notifications/${id}`, {
		method: 'DELETE',
		credentials: 'include',
	});
};

export const createStoreNotification = async (
	data: BroadCastsCreateSchemaType,
) => {
	return await fetch('/admin/store-notifications', {
		credentials: 'include',
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data),
	}).then((res) => res.json());
};

export const updateStoreNotificationById = async (
	id: string,
	data: BroadCastsCreateSchemaType,
) => {
	return await fetch(`/admin/store-notifications/${id}`, {
		credentials: 'include',
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data),
	}).then((res) => res.json());
};

export const getStoreNotificationById = async (
	id: string,
): Promise<EnrichedStoreNotification> => {
	return await fetch(`/admin/store-notifications/${id}`, {
		credentials: 'include',
		method: 'GET',
		headers: { 'Content-Type': 'application/json' },
	}).then((res) => res.json());
};

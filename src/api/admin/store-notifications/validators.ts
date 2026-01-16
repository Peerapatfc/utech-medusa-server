import { z } from 'zod';
import {
	StoreNotificationBroadcastType,
	StoreNotificationCategory,
	StoreNotificationRecipientType,
	StoreNotificationStatus,
} from '../../../types/store-notification';
import { createOperatorMap } from '../../utils/validators';

export const AdminGetStoreNotificationsParams = z.object({
	q: z.string().optional(),
	status: z.nativeEnum(StoreNotificationStatus).optional(),
	category: z.nativeEnum(StoreNotificationCategory).optional(),
	recipient_type: z.nativeEnum(StoreNotificationRecipientType).optional(),
	broadcast_type: z.nativeEnum(StoreNotificationBroadcastType).optional(),
	customer_ids: z.string().optional(),
	customer_group_ids: z.string().optional(),
	limit: z.coerce.number().default(10),
	offset: z.coerce.number().default(0),
	order: z.string().optional(),
	created_at: createOperatorMap().optional(),
	scheduled_at: createOperatorMap().optional(),
});

export const AdminGetStoreNotificationParams = z.object({
	id: z.string().optional(),
});

export type AdminGetStoreNotificationsParamsType = z.infer<
	typeof AdminGetStoreNotificationsParams
>;
export type AdminGetStoreNotificationParamsType = z.infer<
	typeof AdminGetStoreNotificationParams
>;

export type AdminStoreNotificationListType = {
	validatedQuery: AdminGetStoreNotificationsParamsType;
};

export type AdminStoreNotificationGetType = {
	validatedQuery: AdminGetStoreNotificationParamsType;
};

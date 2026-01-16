import { model } from '@medusajs/framework/utils';
import {
	StoreNotificationBroadcastType,
	StoreNotificationCategory,
	StoreNotificationRecipientType,
	StoreNotificationStatus,
} from '../../../types/store-notification';

const StoreNotificationModel = model.define('store_notification', {
	id: model.id({ prefix: 'sn' }).primaryKey(),
	subject_line: model.text().searchable(),
	description: model.text().searchable().nullable(),
	category: model
		.enum(StoreNotificationCategory)
		.default(StoreNotificationCategory.ANNOUNCEMENT),
	image_url: model.text().nullable(),
	recipient_type: model
		.enum(StoreNotificationRecipientType)
		.default(StoreNotificationRecipientType.ALL),
	customer_group_ids: model.array().nullable(), // customer group ids for targeting recipient
	customer_ids: model.array().nullable(), // customer ids for specific recipient
	status: model
		.enum(StoreNotificationStatus)
		.default(StoreNotificationStatus.DRAFT),
	metadata: model.json().nullable(),
	broadcast_type: model
		.enum(StoreNotificationBroadcastType)
		.default(StoreNotificationBroadcastType.NOW),
	scheduled_at: model.dateTime().nullable(),
	created_by: model.text().nullable(),
	updated_by: model.text().nullable(),
});

export default StoreNotificationModel;

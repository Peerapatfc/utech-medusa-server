import { model } from '@medusajs/framework/utils';

export const NotificationSubscriptionModel = model.define(
	'notification_subscription',
	{
		id: model.id({ prefix: 'nosub' }).primaryKey(),
		endpoint: model.text(),
		keys: model.json(),
		expiration_time: model.number().nullable(),
	},
);

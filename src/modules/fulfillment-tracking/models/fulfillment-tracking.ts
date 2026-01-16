import { model } from '@medusajs/framework/utils';

const fulfillmentTracking = model.define('fulfillment_tracking', {
	id: model.id({ prefix: 'fultr' }).primaryKey(),
	current_status: model.text(),
	tracking_events: model.json(),
	metadata: model.json().nullable(),
});

export default fulfillmentTracking;

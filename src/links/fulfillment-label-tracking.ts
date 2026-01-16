import FulfillmentTracking from '../modules/fulfillment-tracking';
import FulfillmentModule from '@medusajs/medusa/fulfillment';
import { defineLink } from '@medusajs/framework/utils';

export default defineLink(
	FulfillmentModule.linkable.fulfillmentLabel,
	FulfillmentTracking.linkable.fulfillmentTracking,
	{
		database: {
			table: 'fulfillment_label_tracking',
		},
	},
);

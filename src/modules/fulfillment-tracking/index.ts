import { Module } from '@medusajs/framework/utils';
import FulfillmentTrackingService from './service';

export const FULFILLMENT_TRACKING_MODULE = 'fulfillmentTrackingModuleService';

export default Module(FULFILLMENT_TRACKING_MODULE, {
	service: FulfillmentTrackingService,
});

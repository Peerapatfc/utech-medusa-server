import { Module } from '@medusajs/framework/utils';
import StoreNotificationProviderService from './service';

export const STORE_NOTIFICATION_MODULE = 'storeNotificationModuleService';

export default Module(STORE_NOTIFICATION_MODULE, {
	service: StoreNotificationProviderService,
});

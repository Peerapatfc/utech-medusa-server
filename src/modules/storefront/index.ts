import { Module } from '@medusajs/framework/utils';
import StorefrontService from './service';

export const STOREFRONT_MODULE = 'storefrontModuleService';

export default Module(STOREFRONT_MODULE, {
	service: StorefrontService,
});

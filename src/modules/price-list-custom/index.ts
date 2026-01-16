import { Module } from '@medusajs/framework/utils';
import PriceListCustomModuleService from './service';

export const PRICE_LIST_CUSTOM_MODULE = 'priceListCustomModuleService';

export default Module(PRICE_LIST_CUSTOM_MODULE, {
	service: PriceListCustomModuleService,
});

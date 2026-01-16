import { Module } from '@medusajs/framework/utils';
import PreOrderStrapiService from './service';

export const PRE_ORDER_STRAPI_MODULE = 'preOrderModuleService';

export default Module(PRE_ORDER_STRAPI_MODULE, {
	service: PreOrderStrapiService,
});

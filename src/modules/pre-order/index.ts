import { Module } from '@medusajs/framework/utils';
import PreOrderService from './service';

export const PRE_ORDER_SERVICE = 'preOrderService';

export default Module(PRE_ORDER_SERVICE, {
	service: PreOrderService,
});

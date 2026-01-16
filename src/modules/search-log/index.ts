import { Module } from '@medusajs/framework/utils';
import SearchLogModuleService from './service'

export const SEARCH_LOG_MODILE_SERVICE = 'searchLogModuleService';

export default Module(SEARCH_LOG_MODILE_SERVICE, {
  service: SearchLogModuleService,
});
import { Module } from '@medusajs/framework/utils';
import ImportService from './service';

export const IMPORT_SERVICE = 'importModuleService';

export default Module(IMPORT_SERVICE, {
	service: ImportService,
});

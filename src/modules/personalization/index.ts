import PersonalizationModuleService from './service';
import { Module } from '@medusajs/framework/utils';

export const PERSONALIZATION_MODULE = 'personalization';

export default Module(PERSONALIZATION_MODULE, {
	service: PersonalizationModuleService,
});

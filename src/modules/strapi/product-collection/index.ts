import { Module } from '@medusajs/framework/utils';
import CollectionStrapiService from './service';

export const COLLECTION_STRAPI_MODULE = 'collectionStrapiModuleService';

export default Module(COLLECTION_STRAPI_MODULE, {
	service: CollectionStrapiService,
});

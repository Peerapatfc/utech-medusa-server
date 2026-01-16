import { Module } from '@medusajs/framework/utils';
import MiniBannerService from './service';

export const MINI_BANNER_MODULE = 'miniBannerService';

export default Module(MINI_BANNER_MODULE, {
	service: MiniBannerService,
});

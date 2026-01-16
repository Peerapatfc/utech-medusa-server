import { ModuleProvider, Modules } from '@medusajs/framework/utils';
import FulfillmentCalculateProviderService from './service';

export default ModuleProvider(Modules.FULFILLMENT, {
	services: [FulfillmentCalculateProviderService],
});

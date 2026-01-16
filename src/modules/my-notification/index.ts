import { ModuleProvider, Modules } from '@medusajs/framework/utils';
import MyNotificationProviderService from './service';

export default ModuleProvider(Modules.NOTIFICATION, {
	services: [MyNotificationProviderService],
});

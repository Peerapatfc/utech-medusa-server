import { MedusaService } from '@medusajs/framework/utils';
import { PickupOption } from './models/pickup-option';
import { PreOrderTemplate } from './models/pre-order-template';
import { PreOrderItemPickupOption } from './models/pre-order-item-pickup-option';
import { PreOrderTemplateItem } from './models/pre-order-item';

class PreOrderService extends MedusaService({
	PickupOption,
	PreOrderTemplate,
	PreOrderTemplateItem,
	PreOrderItemPickupOption,
}) {}

export default PreOrderService;

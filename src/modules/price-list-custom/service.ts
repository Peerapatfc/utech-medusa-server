import { PriceListCustom, PriceListVariant } from './models/price-list-custom';
import { MedusaService } from '@medusajs/framework/utils';
import type { Logger } from '@medusajs/framework/types';

export default class PriceListCustomModuleService extends MedusaService({
	PriceListCustom,
	PriceListVariant,
}) {
	private readonly logger: Logger;
}

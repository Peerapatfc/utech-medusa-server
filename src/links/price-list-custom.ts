import Pricing from '@medusajs/medusa/pricing';
import { defineLink } from '@medusajs/framework/utils';
import PriceListCustomModel from '../modules/price-list-custom';

export default defineLink(Pricing.linkable.priceList, {
	linkable: PriceListCustomModel.linkable.priceListCustom,
	deleteCascade: true,
});

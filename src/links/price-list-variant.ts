import Product from '@medusajs/medusa/product';
import { defineLink } from '@medusajs/framework/utils';
import PriceListCustomModel from '../modules/price-list-custom';

export default defineLink(Product.linkable.productVariant, {
	linkable: PriceListCustomModel.linkable.priceListVariant,
	isList: true,
	deleteCascade: true,
});

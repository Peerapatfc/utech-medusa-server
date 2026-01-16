import { defineRouteConfig } from '@medusajs/admin-sdk';
import { TruckFast } from '@medusajs/icons';
import { PriceListList } from './modules/price-list-list';

const FlashSalePage = () => {
	return <PriceListList />;
};

export const config = defineRouteConfig({
	label: 'Flash Sale',
	icon: TruckFast,
	nested: '/promotions',
});
export default FlashSalePage;

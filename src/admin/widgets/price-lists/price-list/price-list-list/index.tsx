import { defineWidgetConfig } from '@medusajs/admin-sdk';
import { useEffect } from 'react';
import { PriceListList } from './price-list-list';

const PriceListListWidget = () => {
	useEffect(() => {
		const elements = document.querySelectorAll(
			'.shadow-elevation-card-rest.bg-ui-bg-base.w-full.rounded-lg.divide-y.p-0',
		);
		for (const el of elements) {
			if (!el.hasAttribute('data-container')) {
				el.remove();
			}
		}
	}, []);

	return <PriceListList />;
};

export const config = defineWidgetConfig({
	zone: 'price_list.list.before',
});

export default PriceListListWidget;

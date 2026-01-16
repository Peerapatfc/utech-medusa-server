import { defineWidgetConfig } from '@medusajs/admin-sdk';
import { OrderList } from './order-list';
import { useEffect } from 'react';

const OrderListWidget = () => {
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

	return <OrderList />;
};

export const config = defineWidgetConfig({
	zone: 'order.list.after',
});

export default OrderListWidget;

import { defineRouteConfig } from '@medusajs/admin-sdk';
import type { StockLocationDTO } from '@medusajs/framework/types';
import {
	Adjustments,
	ChatBubbleLeftRightSolid,
	Clock,
	CreditCard,
	CubeSolid,
	FlyingBox,
	Link,
	MagnifyingGlass,
} from '@medusajs/icons';
import { Container } from '@medusajs/ui';
import React, { useEffect, useState } from 'react';
import AdvancedSettingButton from '../../components/advanced-setting-button';

const items = [
	{
		title: 'Setting Running number',
		sub_title: 'Manage Order,Invoice and Credit note number',
		url: '/advanced-setting/setting-running-number',
		icon: <CubeSolid />,
	},
	{
		title: 'Payment method expiration',
		sub_title: 'Set expiration time for payment methods',
		url: '/advanced-setting/cancel-order',
		icon: <Clock />,
	},
	{
		title: 'Top Search',
		sub_title: 'Config top search',
		url: '/advanced-setting/top-search',
		icon: <MagnifyingGlass />,
	},
	{
		title: 'Recent Search',
		sub_title: 'Config recent search',
		url: '/advanced-setting/recent-search',
		icon: <MagnifyingGlass />,
	},
	{
		title: 'Review Prohibited Word',
		sub_title: 'Config review prohibited word',
		url: '/advanced-setting/review',
		icon: <ChatBubbleLeftRightSolid />,
	},
	{
		title: 'Delivery method',
		sub_title: 'Manege delivery method for shipping',
		url: '/settings/locations',
		icon: <FlyingBox />,
	},
	{
		title: 'Payment Restriction',
		sub_title: 'Manege payment followup condition',
		url: '/advanced-setting/payment-restriction',
		icon: <CreditCard />,
	},
	{
		title: 'Magento Order History URL',
		sub_title: 'Manege Magento Order History URL',
		url: '/advanced-setting/magento-order-history-url',
		icon: <Link />,
	},

	// {
	// 	title: 'Pre-Order Pickup option',
	// 	sub_title: 'Manege Pre-order pickup option',
	// 	url: '/advanced-setting/pre-order-pickup-option',
	// 	icon: <CreditCard />,
	// },
];

const AdvancedMenuPage = () => {
	const [location, setLocation] = useState<StockLocationDTO | null>(null);
	useEffect(() => {
		const fetchData = async () => {
			const locations = await fetch('/admin/stock-locations', {
				credentials: 'include',
				method: 'GET',
			})
				.then((response) => response.json())
				.then((response) => response.stock_locations);
			if (locations[0]) {
				setLocation(locations[0]);
			}
		};
		fetchData();
	}, []);
	return (
		<Container>
			<h1 style={{ fontWeight: '700', fontSize: '20px' }}>Advanced Settings</h1>
			<p className='mt-4 mb-6'>Manage the advanced settings for your store</p>
			<div className='grid grid-cols-3 gap-4'>
				{items.map((item, index: number) => {
					let url = item.url;
					if (url === '/settings/locations') {
						url = `${url}/${location?.id}`;
					}
					return (
						<React.Fragment key={index.toString()}>
							<AdvancedSettingButton
								title={item.title}
								sub_title={item.sub_title}
								handleUrl={url}
								icon={item.icon}
							/>
							{(index + 1) % 2 === 0 && <div />}
						</React.Fragment>
					);
				})}
			</div>
		</Container>
	);
};

export const config = defineRouteConfig({
	label: 'Advanced Settings',
	icon: Adjustments,
});
export default AdvancedMenuPage;

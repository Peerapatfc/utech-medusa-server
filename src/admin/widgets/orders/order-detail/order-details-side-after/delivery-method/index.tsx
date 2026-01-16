import { defineWidgetConfig } from '@medusajs/admin-sdk';
import type { AdminOrder, DetailWidgetProps } from '@medusajs/framework/types';
import { Container, Heading } from '@medusajs/ui';
import { BuildingStorefront, TruckFast } from '@medusajs/icons';
import { useMemo } from 'react';

const OrderDeliveryMethodWidget = ({ data }: DetailWidgetProps<AdminOrder>) => {
	const shipping = data.shipping_methods;

	const isStorePickup = useMemo(() => {
		return shipping.some((method) => {
			const name = method.name.toLowerCase();
			return name.includes('store') && name.includes('pickup');
		});
	}, [shipping]);

	return (
		<Container
			className='divide-y p-0'
			data-container='custom-customer-section'
		>
			<div className='flex items-center justify-between px-6 py-4'>
				<Heading level='h2'>Delivery Method</Heading>
				<div className='flex items-center gap-x-4'>
					{shipping.map((method) => (
						<div key={method.id} className='flex items-center'>
							{isStorePickup && (
								<BuildingStorefront className='text-base text-medusa-fg-subtle mr-1' />
							)}

							{!isStorePickup && (
								<TruckFast className='text-base text-medusa-fg-subtle mr-1' />
							)}
							<span className='text-sm'>{method.name}</span>
						</div>
					))}
				</div>
			</div>
		</Container>
	);
};

export const config = defineWidgetConfig({
	zone: 'order.details.side.after',
});

export default OrderDeliveryMethodWidget;

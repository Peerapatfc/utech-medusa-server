import type { PreOrderDetail } from '@customTypes/pre-order';
import { defineWidgetConfig } from '@medusajs/admin-sdk';
import type { AdminOrder, DetailWidgetProps } from '@medusajs/framework/types';
import { Container, Heading } from '@medusajs/ui';
import { useOrder } from '../../../../../hooks/api/orders';
import { PreOrderInfo } from './components/pre-order-info';

const PreOrderInformationWidget = ({ data }: DetailWidgetProps<AdminOrder>) => {
	const id = data.id as string;
	const { order: preOrderDetail } = useOrder(id, {
		fields: 'metadata',
	}) as { order: PreOrderDetail };

	const isPreOrder = preOrderDetail?.metadata?.is_pre_order;

	return (
		<>
			{isPreOrder && (
				<Container
					className='divide-y p-0'
					data-container='custom-customer-section'
				>
					<div className='flex items-center justify-between px-6 py-4'>
						<Heading level='h2'>Pre-order</Heading>
					</div>
					{preOrderDetail && (
						<>
							<PreOrderInfo.Code data={preOrderDetail} />
							<PreOrderInfo.CodeImage data={preOrderDetail} />
							<PreOrderInfo.PickupOption data={preOrderDetail} />
							<PreOrderInfo.IDCard data={preOrderDetail} />
						</>
					)}
				</Container>
			)}
		</>
	);
};

export const config = defineWidgetConfig({
	zone: 'order.details.side.after',
});

export default PreOrderInformationWidget;

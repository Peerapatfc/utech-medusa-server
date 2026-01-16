import { defineWidgetConfig } from '@medusajs/admin-sdk';
import type { AdminOrder, DetailWidgetProps } from '@medusajs/framework/types';
import { Container, Heading } from '@medusajs/ui';
import { AddSerialNumber } from './components/add-serial-number';
import { OrderDocuments } from './components/order-documents';

const OrderDocumentsWidget = ({ data }: DetailWidgetProps<AdminOrder>) => {
	const id = data.id as string;

	return (
		<Container
			className='divide-y p-0'
			data-container='custom-customer-section'
		>
			<div className='flex items-center justify-between px-6 py-4'>
				<Heading level='h2'>Documents</Heading>
			</div>

			<AddSerialNumber id={id} />
			<OrderDocuments id={id} order={data} />
		</Container>
	);
};

export const config = defineWidgetConfig({
	zone: 'order.details.side.after',
});

export default OrderDocumentsWidget;

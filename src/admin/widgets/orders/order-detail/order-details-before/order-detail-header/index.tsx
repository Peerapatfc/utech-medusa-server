import { defineWidgetConfig } from '@medusajs/admin-sdk';
import { Container, Copy, Heading, StatusBadge, Text } from '@medusajs/ui';
import { useTranslation } from 'react-i18next';
import type {
	DetailWidgetProps,
	AdminOrder,
	OrderStatus,
} from '@medusajs/framework/types';
import { useOrder } from '../../../../../hooks/api/orders';
import { getOrderStatus } from '../../../../../lib/order-helpers';

interface CustomAdminOrder extends AdminOrder {
	status: OrderStatus;
	metadata: {
		order_no: string;
		invoice_no: string;
		payment_invoice_no: string;
	};
}

const OrderStatusBadge = ({ status }: { status: OrderStatus }) => {
	const { t } = useTranslation();
	const { label, color } = getOrderStatus(t, status);

	return (
		<StatusBadge color={color} className='text-nowrap'>
			{label}
		</StatusBadge>
	);
};

const OrderDetailHeaderWidget = ({
	data,
}: DetailWidgetProps<CustomAdminOrder>) => {
	const id = data.id;
	const status = data.status;

	const { order } = useOrder(id, {
		fields: 'metadata',
	}) as { order: CustomAdminOrder };

	const orderNo = order?.metadata?.order_no || '';
	const invoiceNo = order?.metadata?.invoice_no || '';
	const paymentInvoiceNo = order?.metadata?.payment_invoice_no || '';

	return (
		<Container className='flex justify-between px-6 py-4'>
			<div>
				<div className='flex items-center gap-x-1'>
					<Heading level='h2'>
						<span className='text-gray-400'>Order Number:</span> #{orderNo}
						<Copy content={orderNo} className='text-ui-fg-muted ml-1' />
					</Heading>
				</div>
				<Text size='small' className='text-ui-fg-subtle'>
					<span className='text-gray-400 mr-2'>Invoice:</span>
					{invoiceNo || '-'}
					{invoiceNo && (
						<Copy content={invoiceNo} className='text-ui-fg-muted ml-1' />
					)}
				</Text>
				{paymentInvoiceNo && (
					<Text size='small' className='text-ui-fg-subtle'>
						<span className='text-gray-400  mr-2'>Invoice Payment:</span>
						{paymentInvoiceNo}
						<Copy
							content={paymentInvoiceNo}
							className='text-ui-fg-muted ml-1'
						/>
					</Text>
				)}
			</div>
			<div>
				<div className='flex items-start gap-x-1'>
					<Heading level='h2'>
						<OrderStatusBadge status={status} />
					</Heading>
				</div>
			</div>
		</Container>
	);
};

// The widget's configurations
export const config = defineWidgetConfig({
	zone: 'order.details.before',
});

export default OrderDetailHeaderWidget;

import { defineWidgetConfig } from '@medusajs/admin-sdk';
import type { AdminOrder, DetailWidgetProps } from '@medusajs/framework/types';
import { Container, Heading } from '@medusajs/ui';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CustomerInfo } from '../../../../../components/common/customer-info';
import { useCustomer } from '../../../../../hooks/api/customers';

const OrderCustomerInformationWidget = ({
	data,
}: DetailWidgetProps<AdminOrder>) => {
	const { t } = useTranslation();

	const customerId = data.customer_id as string;
	const { customer } = useCustomer(customerId);

	useEffect(() => {
		const container = document.querySelector(
			'[data-container="custom-customer-section"]',
		);

		const parentDiv = container?.nextElementSibling?.querySelector('div');
		if (
			parentDiv &&
			parentDiv?.querySelector('h2')?.textContent?.trim() === 'Customer'
		) {
			parentDiv.remove();
		}
	}, []);

	return (
		<div
			data-container='custom-customer-section'
			className='flex flex-col gap-y-3'
		>
			<Container className='divide-y p-0 '>
				<div className='flex items-center justify-between px-6 py-4'>
					<Heading level='h2'>{t('fields.customer')}</Heading>
				</div>
				{/* <Header /> */}
				<CustomerInfo.Id data={data} />
				<CustomerInfo.Account data={customer} />
				<CustomerInfo.Contact data={data} />
				<CustomerInfo.Company data={data} />
				<CustomerInfo.Addresses data={data} />
			</Container>
			<Container className='divide-y p-0'>
				<div className='flex items-center justify-between px-6 py-4'>
					<Heading level='h2'>Tax</Heading>
				</div>
				<CustomerInfo.TaxAddresses data={data} />
			</Container>
		</div>
	);
};

export const config = defineWidgetConfig({
	zone: 'order.details.side.before',
});

export default OrderCustomerInformationWidget;

import { defineWidgetConfig } from '@medusajs/admin-sdk';
import { Container, Heading } from '@medusajs/ui';
import { DataTable } from '../../../components/table/data-table';
import { useDataTable } from '../../../hooks/use-data-table';
import type {
	DetailWidgetProps,
	AdminCustomer,
} from '@medusajs/framework/types';
import { useCustomerAddressTableColumns } from './use-customer-address-table-columns';
import { useEffect, useState } from 'react';
import { sdk } from '../../../lib/client';

const PAGE_SIZE = 10;

const CustomerAddressWidget = ({ data }: DetailWidgetProps<AdminCustomer>) => {
	const columns = useCustomerAddressTableColumns();
	const [customer, setCustomer] = useState<AdminCustomer>();

	useEffect(() => {
		const fetchData = async () => {
			const { customer } = await sdk.admin.customer.retrieve(data.id, {
				fields: ['id', 'email', '*addresses'].join(','),
			});
			setCustomer(customer);
		};
		fetchData();
	}, [data]);

	const { table } = useDataTable({
		data: customer?.addresses ?? [],
		columns,
		count: customer?.addresses.length ?? 0,
		enablePagination: true,
		getRowId: (row) => row.id,
		pageSize: PAGE_SIZE,
	});
	return (
		<Container className='divide-y p-0'>
			<div className='flex items-center justify-between px-6 py-4'>
				<div>
					<Heading level='h2'>Customer Address</Heading>
				</div>
			</div>
			<DataTable
				table={table}
				columns={columns}
				count={customer?.addresses.length ?? 0}
				pageSize={PAGE_SIZE}
				navigateTo={(row) => `view_address/${row.original.id}`}
				pagination
			/>
		</Container>
	);
};

export const config = defineWidgetConfig({
	zone: 'customer.details.after',
});

export default CustomerAddressWidget;

import { createColumnHelper } from '@tanstack/react-table';
import { useMemo } from 'react';
import { TextHeader } from '../../../components/table/table-cells/common/text-cell';
import type { AdminCustomerAddress } from '@medusajs/framework/types';
import { StatusCell } from '../../../components/table/table-cells/common/status-cell';

const columnHelper = createColumnHelper<AdminCustomerAddress>();

export const useCustomerAddressTableColumns = () => {
	return useMemo(
		() => [
			columnHelper.accessor('first_name', {
				header: () => <TextHeader text={'First Name'} />,
				cell: (info) => info.getValue(),
			}),
			columnHelper.accessor('last_name', {
				header: () => <TextHeader text={'Last Name'} />,
				cell: (info) => info.getValue(),
			}),
			columnHelper.accessor('metadata.address_type', {
				header: () => <TextHeader text={'Type'} />,
				cell: ({ row }) => {
					if (row.original?.metadata?.address_type === 'billing') {
						return <StatusCell color='blue'>Billing</StatusCell>;
					}
					if (row.original?.metadata?.address_type === 'tax_invoice') {
						return <StatusCell color='red'>Tax Invoice</StatusCell>;
					}
					return <StatusCell color='green'>Shipping</StatusCell>;
				},
			}),
			columnHelper.accessor('address_1', {
				header: () => <TextHeader text={'Address 1'} />,
				cell: (info) => info.getValue(),
			}),
			columnHelper.accessor('address_2', {
				header: () => <TextHeader text={'Address 2'} />,
				cell: (info) => info.getValue(),
			}),
			columnHelper.accessor('metadata.sub_district', {
				header: () => <TextHeader text={'Sub District'} />,
				cell: (info) => info.getValue(),
			}),
			columnHelper.accessor('city', {
				header: () => <TextHeader text={'City'} />,
				cell: (info) => info.getValue(),
			}),
			columnHelper.accessor('province', {
				header: () => <TextHeader text={'Province'} />,
				cell: (info) => info.getValue(),
			}),
			columnHelper.accessor('postal_code', {
				header: () => <TextHeader text={'Postcode'} />,
				cell: (info) => info.getValue(),
			}),
		],
		[],
	);
};

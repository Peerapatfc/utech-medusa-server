import type { HttpTypes } from '@medusajs/types';
import { Button, Checkbox, toast } from '@medusajs/ui';
import { keepPreviousData } from '@tanstack/react-query';
import {
	type OnChangeFn,
	type RowSelectionState,
	createColumnHelper,
} from '@tanstack/react-table';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StackedDrawer } from '../../../../../components/modals/stacked-drawer';
import { StackedFocusModal } from '../../../../../components/modals/stacked-focus-modal';
import { DataTable } from '../../../../../components/table/data-table';
import { useCustomers } from '../../../../../hooks/api/customers';
import { useCustomerTableColumns } from '../../../../../hooks/table/columns/use-customer-table-columns';
import { useCustomerTableQuery } from '../../../../../hooks/table/query/use-customer-table-query';
import { useDataTable } from '../../../../../hooks/use-data-table';
import type { BroadCastsCustomer } from '../../schemas';
import { useCustomerTableFilters } from '../../hooks/use-customer-table-filters';

const PAGE_SIZE = 50;
const PREFIX = 'csm';

type BroadCastsCustomerFormProps = {
	type: 'focus' | 'drawer';
	state: BroadCastsCustomer[];
	setState: (state: BroadCastsCustomer[]) => void;
	setIsOpen: (id: string, open: boolean) => void;
};

const initRowSelection = (state: BroadCastsCustomer[]) => {
	return state.reduce((acc, customer) => {
		acc[customer.id] = true;
		return acc;
	}, {} as RowSelectionState);
};

export const BroadCastsCustomerForm = ({
	state,
	setState,
	type,
	setIsOpen,
}: BroadCastsCustomerFormProps) => {
	const { t } = useTranslation();

	const [rowSelection, setRowSelection] = useState<RowSelectionState>(
		initRowSelection(state),
	);
	const [intermediate, setIntermediate] = useState<BroadCastsCustomer[]>(state);

	useEffect(() => {
		setRowSelection(initRowSelection(state));
		setIntermediate(state);
	}, [state]);

	const { searchParams, raw } = useCustomerTableQuery({
		pageSize: PAGE_SIZE,
		prefix: PREFIX,
	});
	const { customers, count, isLoading, isError, error } = useCustomers(
		{
			...searchParams,
			has_account: true,
			fields: 'id,email,first_name,last_name,has_account,created_at,updated_at',
		},
		{
			placeholderData: keepPreviousData,
		},
	);

	const updater: OnChangeFn<RowSelectionState> = (value) => {
		const state = typeof value === 'function' ? value(rowSelection) : value;
		const currentIds = Object.keys(rowSelection);

		const ids = Object.keys(state);

		const newIds = ids.filter((id) => !currentIds.includes(id));
		const removedIds = currentIds.filter((id) => !ids.includes(id));

		const newCustomers =
			customers
				?.filter((csm) => newIds.includes(csm.id))
				.map((csm) => ({
					id: csm.id,
					name: `${csm.first_name || '-'} ${csm.last_name || ''}`,
					email: csm.email || '-',
					has_account: csm.has_account,
				})) || [];

		const filteredIntermediate = intermediate.filter(
			(csm) => !removedIds.includes(csm.id),
		);

		setIntermediate([...filteredIntermediate, ...newCustomers]);
		setRowSelection(state);
	};

	const handleSave = () => {
		setState(intermediate);
	};

	const filters = useCustomerTableFilters();
	const columns = useColumns();

	const { table } = useDataTable({
		data: customers || [],
		columns,
		count,
		enablePagination: true,
		enableRowSelection: true,
		getRowId: (row) => row.id,
		rowSelection: {
			state: rowSelection,
			updater,
		},
		pageSize: PAGE_SIZE,
		prefix: PREFIX,
	});

	const Component = type === 'focus' ? StackedFocusModal : StackedDrawer;

	if (isError) {
		toast.error(error?.message ?? '');
		setTimeout(() => {
			setIsOpen('csm', false);
		}, 100);
	}

	return (
		<div className='flex size-full flex-col overflow-hidden'>
			<div className='flex items-center justify-end'>
				<Button size='small' variant='secondary' asChild>
					{t('actions.create')}
				</Button>
			</div>
			<Component.Body className='min-h-0 p-0'>
				<DataTable
					table={table}
					columns={columns}
					pageSize={PAGE_SIZE}
					count={count}
					isLoading={isLoading}
					filters={filters}
					orderBy={[
						{ key: 'first_name', label: t('fields.name') },
						{ key: 'created_at', label: t('fields.createdAt') },
						{ key: 'updated_at', label: t('fields.updatedAt') },
					]}
					layout='fill'
					pagination
					search
					prefix={PREFIX}
					queryObject={raw}
				/>
			</Component.Body>
			<Component.Footer>
				<Component.Close asChild>
					<Button variant='secondary' size='small' type='button'>
						{t('actions.cancel')}
					</Button>
				</Component.Close>
				<Button type='button' size='small' onClick={handleSave}>
					{t('actions.save')}
				</Button>
			</Component.Footer>
		</div>
	);
};

const columnHelper = createColumnHelper<HttpTypes.AdminCustomer>();

const useColumns = () => {
	const base = useCustomerTableColumns();

	return useMemo(
		() => [
			columnHelper.display({
				id: 'select',
				header: ({ table }) => {
					return (
						<Checkbox
							checked={
								table.getIsSomePageRowsSelected()
									? 'indeterminate'
									: table.getIsAllPageRowsSelected()
							}
							onCheckedChange={(value) =>
								table.toggleAllPageRowsSelected(!!value)
							}
						/>
					);
				},
				cell: ({ row }) => {
					return (
						<Checkbox
							checked={row.getIsSelected()}
							onCheckedChange={(value) => row.toggleSelected(!!value)}
							onClick={(e) => {
								e.stopPropagation();
							}}
						/>
					);
				},
			}),
			...base,
		],
		[base],
	);
};

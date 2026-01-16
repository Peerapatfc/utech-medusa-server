import {
	createDataTableColumnHelper,
	type DataTableFilter,
	Tooltip,
} from '@medusajs/ui';
import { DataTable } from '../../../../components/data-table';
import { useDataTableDateFilters } from '../../../../components/data-table/hooks/general/use-data-table-date-filters';
import type { AdminLogResponse } from '@customTypes/admin';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { sdk } from '../../../../lib/client';
import { useDate } from '../../../../hooks/use-date';
import { useQueryParams } from '../../../../hooks/use-query-params';
import { getActivityDescription } from './generate-activity';

const fetchActivityLogs = (query: {
	offset: number;
	limit: number;
	order?: string;
	q?: string;
	actor_id?: string;
	created_at?: { start: string; end: string };
	actions?: string;
}) => {
	return sdk.client.fetch<{
		activity_logs: AdminLogResponse[];
		limit: number;
		offset: number;
		count: number;
	}>('/admin/custom/users/activity-logs', {
		query,
	});
};

const ActivityLogsTable = () => {
	const PAGE_SIZE = 20;
	const columns = useColumns();
	const filters = useFilters();

	const { offset, created_at, order, q, actor_id, actions } = useQueryParams([
		'offset',
		'order',
		'q',
		'actor_id',
		'created_at',
		'actions',
	]);

	const { data, isPending } = useQuery<{
		activity_logs: AdminLogResponse[];
		limit: number;
		offset: number;
		count: number;
	}>({
		queryKey: [
			'activity-logs',
			offset,
			order,
			q,
			actor_id,
			created_at,
			actions,
		],
		queryFn: () =>
			fetchActivityLogs({
				offset: offset ? Number.parseInt(offset) : 0,
				limit: PAGE_SIZE,
				order,
				q,
				created_at: created_at ? JSON.parse(created_at) : undefined,
				actions: actions ? actions : undefined,
			}),
		placeholderData: undefined,
	});

	const count = data?.count ?? 0;

	return (
		<DataTable
			data={data?.activity_logs ?? []}
			columns={columns}
			enableSearch={true}
			autoFocusSearch={true}
			heading=''
			filters={filters}
			rowCount={count}
			getRowId={(row) => row.id}
			emptyState={{
				empty: {
					heading: 'No data',
					description: 'No activity logs found',
				},
				filtered: {
					heading: 'No data',
					description: 'No activity logs found',
				},
			}}
			pageSize={PAGE_SIZE}
			isLoading={isPending}
		/>
	);
};

const columnHelper = createDataTableColumnHelper<AdminLogResponse>();
const useColumns = () => {
	const { getFullDate, getRelativeDate } = useDate();
	const { t } = useTranslation();

	return useMemo(
		() => [
			columnHelper.accessor('action_name', {
				header: 'Activity',
				enableSorting: false,
				cell: ({ row }) => {
					return getActivityDescription(row.original);
				},
			}),
			columnHelper.accessor('actor', {
				header: 'Admin name',
				enableSorting: false,
				cell: ({ row }) => {
					return <span className='capitalize'>{row.original.actor}</span>;
				},
			}),
			columnHelper.accessor('created_at', {
				header: 'Date',
				enableSorting: true,
				sortAscLabel: t('filters.sorting.dateAsc'),
				sortDescLabel: t('filters.sorting.dateDesc'),
				cell: ({ row }) => {
					return (
						<Tooltip
							content={getFullDate({
								date: row.original.created_at,
								includeTime: true,
							})}
						>
							<span>{getRelativeDate(row.original.created_at)}</span>
						</Tooltip>
					);
				},
			}),
		],
		[getFullDate, t, getRelativeDate],
	);
};

const useFilters = () => {
	const dateFilters = useDataTableDateFilters();

	const orderStatusFilter: DataTableFilter = {
		id: 'actions',
		label: 'Action',
		type: 'select',
		options: [
			{
				label: 'Cancel Order',
				value: 'order-canceled',
			},
			{
				label: 'Auto Cancel Order',
				value: 'order-auto_cancel',
			},
			{
				label: 'Update Inventory QTY',
				value: 'inventory_item-updated',
			},
			{
				label: 'Create Fulfillment',
				value: 'fulfillment-created',
			},
			{
				label: 'Mark as Shipped',
				value: 'fulfillment-mark_as_shipped',
			},
			{
				label: 'Mark as Delivered',
				value: 'fulfillment-mark_as_delivered',
			},
			{
				label: 'Capture Payment',
				value: 'payment-caputured',
			},
			{
				label: 'Update Product',
				value: 'product-updated',
			},
			{
				label: 'Create Product',
				value: 'product-created',
			},
			{
				label: 'Create Variant',
				value: 'product_variant-created',
			},
			{
				label: 'Update Variant',
				value: 'product_variant-updated',
			},
			{
				label: 'Delete Variant',
				value: 'product_variant-deleted',
			},
			{
				label: 'Update Price',
				value: 'price-updated',
			},
		],
	};

	return useMemo(() => {
		const filters = [...dateFilters];
		filters.push(orderStatusFilter);

		return filters;
	}, [dateFilters]);
};

export default ActivityLogsTable;

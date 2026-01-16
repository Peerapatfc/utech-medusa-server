import { defineWidgetConfig } from '@medusajs/admin-sdk';
import { Container, createDataTableColumnHelper } from '@medusajs/ui';
import { DataTable } from '../../../../components/data-table';
import { useDataTableDateFilters } from '../../../../components/data-table/hooks/general/use-data-table-date-filters';
import type { InventoryItemLog } from '@customTypes/admin';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { sdk } from '../../../../lib/client';
import { useDate } from '../../../../hooks/use-date';
import { useQueryParams } from '../../../../hooks/use-query-params';
import type {
	AdminInventoryItem,
	DetailWidgetProps,
} from '@medusajs/framework/types';

interface InventoryItemLogResponse {
	inventory_item_logs: InventoryItemLog[];
	count: number;
	offset: number;
	limit: number;
}

const fetchLogs = async (
	id: string,
	query: {
		offset: number;
		limit: number;
		created_at?: string;
		updated_at?: string;
	},
): Promise<InventoryItemLogResponse> => {
	try {
		const response = await sdk.client.fetch<InventoryItemLogResponse>(
			`/admin/custom/inventory-items/${id}/quantity-change-logs`,
			{
				query,
			},
		);
		return response;
	} catch (error) {
		console.error('Error fetching logs:', error);
		return {
			inventory_item_logs: [],
			count: 0,
			offset: query.offset,
			limit: query.limit,
		};
	}
};

const InventoryQuantityChangeLogsWidget = ({
	data: _data,
}: DetailWidgetProps<AdminInventoryItem>) => {
	const { id } = _data;
	const { offset, created_at, updated_at } = useQueryParams([
		'offset',
		'created_at',
		'updated_at',
	]);

	const columns = useColumns();
	// const filters = useFilters();
	const PAGE_SIZE = 20;

	const { data, isLoading } = useQuery<InventoryItemLogResponse>({
		queryKey: [
			'quantity-change-logs',
			id,
			offset, // ✅ Ensures refetching on pagination
			created_at,
			updated_at,
		],
		queryFn: () =>
			fetchLogs(id, {
				offset: offset ? Number.parseInt(offset) : 0,
				limit: PAGE_SIZE,
				created_at: created_at ? JSON.parse(created_at) : undefined,
				updated_at: updated_at ? JSON.parse(updated_at) : undefined,
			}),
		placeholderData: (prevData) =>
			prevData ?? {
				inventory_item_logs: [],
				count: 0,
				offset: 0,
				limit: PAGE_SIZE,
			},
		staleTime: 5000, // ✅ Prevents unnecessary refetching for 5s
	});

	const count = data?.count ?? 0;
	const inventoryItemLogs = data?.inventory_item_logs ?? [];

	return (
		<Container className='overflow-hidden p-0'>
			<DataTable
				data={inventoryItemLogs}
				columns={columns}
				// filters={filters}
				enableSearch={false}
				heading='Quantity Change Logs'
				rowCount={count}
				getRowId={(row) => row.id}
				emptyState={{
					empty: {
						heading: 'No logs found',
						description: 'No logs found',
					},
					filtered: {
						heading: 'No logs found',
						description: 'No logs found',
					},
				}}
				pageSize={PAGE_SIZE}
				isLoading={isLoading}
			/>
		</Container>
	);
};

const columnHelper = createDataTableColumnHelper<InventoryItemLog>();

const useColumns = () => {
	const { t } = useTranslation();
	const { getFullDate } = useDate();

	return useMemo(
		() => [
			columnHelper.accessor('action_name', {
				header: 'Change Action',
				enableSorting: false,
				// enableSorting: true,
				// sortAscLabel: t('filters.sorting.alphabeticallyAsc'),
				// sortDescLabel: t('filters.sorting.alphabeticallyDesc'),
				cell: ({ row }) => {
					return <span className='capitalize'>{row.original.action}</span>;
				},
			}),
			columnHelper.accessor('actor_name', {
				header: 'Updated By',
				enableSorting: false,
				// enableSorting: true,
				// sortAscLabel: t('filters.sorting.alphabeticallyAsc'),
				// sortDescLabel: t('filters.sorting.alphabeticallyDesc'),
			}),
			columnHelper.accessor('from_quantity', {
				header: 'Previous',
				enableSorting: false,
				cell: ({ row }) => {
					return (
						<span>
							{row.original.action === 'updated' && row.original.from_quantity}
							{row.original.action !== 'updated' && '-'}
						</span>
					);
				},
			}),
			columnHelper.accessor('to_quantity', {
				header: 'New',
				enableSorting: false,
				cell: ({ row }) => {
					return (
						<span>
							{row.original.action === 'updated' && row.original.to_quantity}
							{row.original.action !== 'updated' && '-'}
						</span>
					);
				},
			}),
			columnHelper.accessor('metadata', {
				header: 'Changed',
				enableSorting: false,
				cell: ({ row }) => {
					const getChanged = () => {
						if (row.original.action === 'reserved') {
							return `-${row.original.metadata?.reserved_quantity}`;
						}

						if (row.original.action === 'returned') {
							return `+${row.original.metadata?.returned_quantity}`;
						}

						if (row.original.action === 'updated') {
							const from = row.original.from_quantity;
							const to = row.original.to_quantity;

							if (from > to) {
								return `-${from - to}`;
							}

							if (from < to) {
								return `+${to - from}`;
							}

							return '0';
						}
					};

					return <span>{getChanged()}</span>;
				},
			}),
			columnHelper.accessor('metadata.available_quantity', {
				header: 'Available',
				enableSorting: false,
				cell: ({ row }) => {
					return (
						<span>{row.original.metadata?.available_quantity as string}</span>
					);
				},
			}),
			columnHelper.accessor('created_at', {
				header: 'At',
				// enableSorting: false,
				enableSorting: true,
				sortAscLabel: t('filters.sorting.alphabeticallyAsc'),
				sortDescLabel: t('filters.sorting.alphabeticallyDesc'),
				cell: ({ row }) => {
					return (
						<span>
							{getFullDate({
								date: row.original.created_at,
								includeTime: true,
							})}
						</span>
					);
				},
			}),
			columnHelper.accessor('metadata.description', {
				header: 'Desc',
				enableSorting: false,
				cell: ({ row }) => {
					return (
						<span>{(row.original.metadata?.description as string) || ''}</span>
					);
				},
			}),
		],
		[t, getFullDate],
	);
};

const useFilters = () => {
	const dateFilters = useDataTableDateFilters();

	return useMemo(() => {
		return dateFilters;
	}, [dateFilters]);
};

export const config = defineWidgetConfig({
	zone: 'inventory_item.details.after',
});

export default InventoryQuantityChangeLogsWidget;

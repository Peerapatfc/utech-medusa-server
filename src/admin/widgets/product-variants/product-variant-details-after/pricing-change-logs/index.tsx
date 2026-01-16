import { defineWidgetConfig } from '@medusajs/admin-sdk';
import { Container, createDataTableColumnHelper } from '@medusajs/ui';
import { DataTable } from '../../../../components/data-table';
import type { PriceChangeLog } from '@customTypes/admin';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { sdk } from '../../../../lib/client';
import { useDate } from '../../../../hooks/use-date';
import { useQueryParams } from '../../../../hooks/use-query-params';
import type {
	AdminProductVariant,
	DetailWidgetProps,
} from '@medusajs/framework/types';

interface PriceChangeLogResponse {
	pricing_change_logs: PriceChangeLog[];
	count: number;
	offset: number;
	limit: number;
}

const fetchLogs = async (
	variantId: string,
	product_id: string,
	query: {
		offset: number;
		limit: number;
		created_at?: string;
		updated_at?: string;
	},
): Promise<PriceChangeLogResponse> => {
	try {
		const response = await sdk.client.fetch<PriceChangeLogResponse>(
			`/admin/custom/products/${product_id}/variants/${variantId}/pricing-change-logs`,
			{
				query,
			},
		);
		return response;
	} catch (error) {
		console.error('Error fetching logs:', error);
		return {
			pricing_change_logs: [],
			count: 0,
			offset: query.offset,
			limit: query.limit,
		};
	}
};

const InventoryQuantityChangeLogsWidget = ({
	data: _data,
}: DetailWidgetProps<AdminProductVariant>) => {
	const { id: variantId, product_id } = _data;
	const { offset, created_at, updated_at } = useQueryParams([
		'offset',
		'created_at',
		'updated_at',
	]);

	const columns = useColumns();
	const PAGE_SIZE = 20;

	const { data, isLoading } = useQuery<PriceChangeLogResponse>({
		queryKey: [
			'quantity-change-logs',
			variantId,
			offset, // ✅ Ensures refetching on pagination
			created_at,
			updated_at,
		],
		queryFn: () =>
			fetchLogs(variantId, product_id as string, {
				offset: offset ? Number.parseInt(offset) : 0,
				limit: PAGE_SIZE,
				created_at: created_at ? JSON.parse(created_at) : undefined,
				updated_at: updated_at ? JSON.parse(updated_at) : undefined,
			}),
		placeholderData: (prevData) =>
			prevData ?? {
				pricing_change_logs: [],
				count: 0,
				offset: 0,
				limit: PAGE_SIZE,
			},
		staleTime: 5000, // ✅ Prevents unnecessary refetching for 5s
	});

	const count = data?.count ?? 0;
	const pricingChangeLogs = data?.pricing_change_logs ?? [];

	return (
		<Container className='overflow-hidden p-0'>
			<DataTable
				data={pricingChangeLogs}
				columns={columns}
				// filters={filters}
				enableSearch={false}
				heading='Price Change Logs'
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

const columnHelper = createDataTableColumnHelper<PriceChangeLog>();

const useColumns = () => {
	const { t } = useTranslation();
	const { getFullDate } = useDate();

	return useMemo(
		() => [
			columnHelper.accessor('price_type', {
				header: 'Type',
				enableSorting: false,
			}),
			columnHelper.accessor('previous_amount', {
				header: 'Previous Price',
				enableSorting: false,
			}),
			columnHelper.accessor('new_amount', {
				header: 'New Price',
				enableSorting: false,
			}),
			columnHelper.accessor('change', {
				header: 'Changed',
				enableSorting: false,
			}),
			columnHelper.accessor('actor_name', {
				header: 'Updated By',
				enableSorting: false,
			}),
			columnHelper.accessor('created_at', {
				header: 'At',
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
		],
		[t, getFullDate],
	);
};

export const config = defineWidgetConfig({
	zone: 'product_variant.details.after',
});

export default InventoryQuantityChangeLogsWidget;

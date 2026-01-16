import {
	Container,
	createDataTableColumnHelper,
	toast,
	usePrompt,
} from '@medusajs/ui';
import { keepPreviousData } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PencilSquare, Trash } from '@medusajs/icons';
import {
	useDeletePriceListLazy,
	usePriceLists,
} from '../../../../../../hooks/api/price-lists';
import { useQueryParams } from '../../../../../../hooks/use-query-params';
import type { HttpTypes, PriceListStatus } from '@medusajs/framework/types';
import { useCallback, useMemo } from 'react';
import { useDataTableDateFilters } from '../../../../../../components/data-table/hooks/general/use-data-table-date-filters';
import { getPriceListStatus } from '../../../../common/utils';
import { StatusCell } from '../../../../../../components/table/table-cells/common/status-cell';
import { DataTable } from '../../../../../../components/data-table';

const PAGE_SIZE = 20;

export const PriceListListTable = () => {
	const { t } = useTranslation();

	const { q, order, offset, status } = useQueryParams([
		'offset',
		'q',
		'order',
		'status',
	]);

	const filters = useFilters();
	const columns = useColumns();

	const { price_lists, count, isError, error, isPending } = usePriceLists(
		{
			q,
			order,
			offset: offset ? Number.parseInt(offset) : 0,
			limit: PAGE_SIZE,
			status: status ? (status.split(',') as PriceListStatus[]) : undefined,
			// fields: 'id,title,status,created_at,updated_at',
		},
		{
			placeholderData: keepPreviousData,
		},
	);

	if (isError) {
		throw error;
	}

	return (
		<Container className='overflow-hidden p-0'>
			<DataTable
				data={price_lists}
				columns={columns}
				filters={filters}
				heading={t('priceLists.domain')}
				rowCount={count}
				getRowId={(row) => row.id}
				rowHref={(row) => `/price-lists/${row.id}`}
				action={{
					label: t('actions.create'),
					to: '/price-lists/create',
				}}
				emptyState={{
					empty: {
						heading: t('priceLists.list.empty.heading'),
						description: t('priceLists.list.empty.description'),
					},
					filtered: {
						heading: t('priceLists.list.filtered.heading'),
						description: t('priceLists.list.filtered.description'),
					},
				}}
				pageSize={PAGE_SIZE}
				isLoading={isPending}
			/>
		</Container>
	);
};

const columnHelper = createDataTableColumnHelper<HttpTypes.AdminPriceList>();

const useColumns = () => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const prompt = usePrompt();

	const { mutateAsync: deletePriceList } = useDeletePriceListLazy();

	const handleDeletePriceList = useCallback(
		async ({ id, title }: { id: string; title: string }) => {
			const res = await prompt({
				title: t('general.areYouSure'),
				description: t('priceLists.delete.confirmation', {
					title: title,
				}),
				confirmText: t('actions.delete'),
				cancelText: t('actions.cancel'),
			});

			if (!res) {
				return;
			}

			await deletePriceList(
				{ id },
				{
					onSuccess: () => {
						toast.success(t('priceLists.delete.successToast', { title }));
						navigate('/price-lists');
					},
					onError: (e) => {
						toast.error(e.message);
					},
				},
			);
		},
		[t, prompt, navigate, deletePriceList],
	);

	return useMemo(
		() => [
			columnHelper.accessor('title', {
				header: t('fields.title'),
				enableSorting: true,
				sortAscLabel: t('filters.sorting.alphabeticallyAsc'),
				sortDescLabel: t('filters.sorting.alphabeticallyDesc'),
			}),
			columnHelper.accessor('status', {
				header: t('fields.status'),
				enableSorting: true,
				sortAscLabel: t('filters.sorting.alphabeticallyAsc'),
				sortDescLabel: t('filters.sorting.alphabeticallyDesc'),
				cell: ({ row }) => {
					const { color, text } = getPriceListStatus(t, row.original);

					return <StatusCell color={color}>{text}</StatusCell>;
				},
			}),
			columnHelper.accessor('prices', {
				header: t('priceLists.fields.priceOverrides.header'),
				cell: ({ row }) => {
					return <span>{row.original.prices?.length ?? 0}</span>;
				},
				enableSorting: true,
				sortAscLabel: t('filters.sorting.alphabeticallyAsc'),
				sortDescLabel: t('filters.sorting.alphabeticallyDesc'),
			}),
			columnHelper.action({
				actions: [
					[
						{
							icon: <PencilSquare />,
							label: t('actions.edit'),
							onClick: (row) => {
								navigate(`/price-lists/${row.row.original.id}/edit`);
							},
						},
					],
					[
						{
							icon: <Trash />,
							label: t('actions.delete'),
							onClick: (row) => {
								handleDeletePriceList({
									id: row.row.original.id,
									title: row.row.original.title ?? '',
								});
							},
						},
					],
				],
			}),
		],
		[t, navigate, handleDeletePriceList],
	);
};

const useFilters = () => {
	const dateFilters = useDataTableDateFilters();

	return useMemo(() => {
		return dateFilters;
	}, [dateFilters]);
};

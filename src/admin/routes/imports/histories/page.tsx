import type { ImportHistory } from '@customTypes/imports';
import { ArrowDownCircle, GridList } from '@medusajs/icons';
import {
	Button,
	Container,
	createDataTableColumnHelper,
	Heading,
} from '@medusajs/ui';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { DataTable } from '../../../components/data-table';
import { useDate } from '../../../hooks/use-date';
import { useQueryParams } from '../../../hooks/use-query-params';
import { sdk } from '../../../lib/client';
import { getImportTypeTitle } from '../utils';

const ImportHistoryPage = () => {
	return (
		<>
			<Container className='divide-y p-0'>
				<div className='flex items-center justify-between px-6 py-4'>
					<Heading level='h2' className='flex items-center'>
						<GridList className='h-6 w-6 mt-2' />
						Import Histories
					</Heading>
					<Link to='/imports'>
						<Button variant='secondary'>Import Data</Button>
					</Link>
				</div>
			</Container>
			<ImportHistoryTable />
		</>
	);
};

const ImportHistoryTable = () => {
	const PAGE_SIZE = 10;
	const columns = useColumns();
	const { order, offset } = useQueryParams(['offset', 'order']);

	const { data, isLoading } = useQuery({
		queryFn: () =>
			sdk.client.fetch<{
				import_histories: ImportHistory[];
				count: number;
			}>('/admin/imports', {
				query: {
					order,
					offset: offset ? Number.parseInt(offset) : 0,
					limit: PAGE_SIZE,
				},
			}),
		queryKey: ['import-histories', { order, offset }],
	});

	const histories = data?.import_histories ?? [];
	const count = data?.count ?? 0;

	return (
		<Container className='overflow-hidden p-0'>
			<DataTable
				data={histories}
				columns={columns}
				filters={[]}
				heading=''
				rowCount={count}
				getRowId={(row) => row.id as string}
				enableSearch={false}
				emptyState={{
					empty: {
						heading: 'No Import Histories',
						description: 'No import histories found',
					},
				}}
				pageSize={PAGE_SIZE}
				isLoading={isLoading}
			/>
		</Container>
	);
};

export default ImportHistoryPage;

const columnHelper = createDataTableColumnHelper<ImportHistory>();
const useColumns = () => {
	const { getFullDate } = useDate();

	return useMemo(
		() => [
			columnHelper.accessor('import_type', {
				header: 'Imported Type',
				cell: ({ row }) => {
					return <span>{getImportTypeTitle(row.original.import_type)}</span>;
				},
			}),
			columnHelper.accessor('created_at', {
				header: 'Imported At',
				cell: ({ row }) => {
					return (
						<span>
							{getFullDate({
								date: row.original.created_at as string,
								includeTime: true,
							})}
						</span>
					);
				},
				enableSorting: true,
				sortLabel: 'Imported At',
			}),
			columnHelper.accessor('original_filename', {
				header: 'Imported File',
				cell: ({ row }) => {
					return <span>{row.original.original_filename}</span>;
				},
			}),
			columnHelper.accessor('imported_by', {
				header: 'Imported By',
				cell: ({ row }) => {
					return <span>{row.original.imported_by_name}</span>;
				},
			}),
			columnHelper.accessor('description', {
				header: 'Description',
				cell: ({ row }) => {
					return <span>{row.original.description}</span>;
				},
			}),
			columnHelper.action({
				actions: [
					[
						{
							icon: <ArrowDownCircle />,
							label: 'Download Imported File',
							onClick: (row) => {
								window.location.href = row.row.original.imported_file_url;
							},
						},
					],
					[
						{
							icon: <ArrowDownCircle />,
							label: 'Download Imported Result',
							onClick: (row) => {
								window.location.href =
									row.row.original.imported_result_file_url;
							},
						},
					],
				],
			}),
		],
		[getFullDate],
	);
};

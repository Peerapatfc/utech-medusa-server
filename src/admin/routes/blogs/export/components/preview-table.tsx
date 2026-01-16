import { Tooltip } from '@medusajs/ui';
import {
	type ColumnDef,
	getCoreRowModel,
	getPaginationRowModel,
	useReactTable,
} from '@tanstack/react-table';
import { format } from 'date-fns';
import { DataTable } from '../../../../components/table/data-table';

type BlogData = {
	id: number;
	title: string;
	createdAt: string;
	publishedAt: string;
	views: number;
	author: string;
	categories: string[];
	relatedProducts: string[];
};

interface PreviewTableProps {
	data: BlogData[];
}

const blogColumns = (): ColumnDef<BlogData>[] => [
	{
		accessorKey: 'createdAt',
		header: 'Created Date',
		cell: ({ getValue }) => {
			const dateValue = getValue() as string;
			return (
				<div className='whitespace-nowrap text-sm'>
					{format(new Date(dateValue), 'dd MMM yyyy HH:mm')}
				</div>
			);
		},
		enableSorting: true,
	},
	{
		accessorKey: 'publishedAt',
		header: 'Published Date',
		cell: ({ getValue }) => {
			const date = getValue() as string;
			if (!date) {
				return <span className='text-ui-fg-muted text-sm'>Not published</span>;
			}

			return (
				<div className='whitespace-nowrap text-sm'>
					{format(new Date(date), 'dd MMM yyyy HH:mm')}
				</div>
			);
		},
		enableSorting: true,
	},
	{
		accessorKey: 'title',
		header: 'Blog Name',
		cell: ({ getValue }) => {
			const title = getValue() as string;
			return (
				<Tooltip content={title}>
					<div className='max-w-md overflow-hidden text-ellipsis whitespace-nowrap'>
						{title}
					</div>
				</Tooltip>
			);
		},
		enableSorting: true,
	},
	{
		accessorKey: 'views',
		header: 'View Counts',
		enableSorting: true,
	},
	{
		accessorKey: 'author',
		header: 'Blog Author',
		cell: ({ getValue }) => (getValue() as string) || 'Unknown',
		enableSorting: true,
	},
	{
		accessorKey: 'categories',
		header: 'Blog Category',
		cell: ({ getValue }) => {
			const categories = getValue() as string[];
			return categories.length > 0 ? categories.join(', ') : '';
		},
		enableSorting: true,
	},
	{
		accessorKey: 'relatedProducts',
		header: 'Related Product',
		cell: ({ getValue }) => {
			const products = getValue() as string[];
			if (products.length === 0) {
				return <span className='text-ui-fg-muted'>None</span>;
			}

			const fullText = products.join(', ');
			const displayText =
				products.length === 1
					? products[0]
					: `${products[0]}${products.length > 1 ? ` (+${products.length - 1} more)` : ''}`;

			return (
				<Tooltip content={fullText}>
					<div className='overflow-hidden text-ellipsis whitespace-nowrap'>
						{displayText}
					</div>
				</Tooltip>
			);
		},
		enableSorting: true,
	},
];

export const PreviewTable = ({ data }: PreviewTableProps) => {
	const columns = blogColumns();

	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		initialState: {
			pagination: {
				pageSize: 10,
				pageIndex: 0,
			},
		},
	});

	return (
		<div className='bg-ui-bg-component mt-6 p-6 rounded-lg border border-ui-border-base'>
			<div className='flex items-center justify-between mb-4'>
				<h2 className='text-lg font-semibold text-ui-fg-base'>Preview Data</h2>
			</div>
			<DataTable
				columns={columns}
				table={table}
				pagination
				count={data.length}
				pageSize={10}
				isLoading={false}
			/>
		</div>
	);
};

export type { BlogData };

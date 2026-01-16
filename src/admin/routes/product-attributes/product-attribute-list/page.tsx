import {
	Container,
	Button,
	Heading,
	Text,
	Input,
	Table,
	usePrompt,
	toast,
	FocusModal,
} from '@medusajs/ui';
import { useEffect, useState, useCallback } from 'react';
import {
	ExclamationCircle,
	PencilSquare,
	CogSixTooth,
	Trash,
	Plus,
} from '@medusajs/icons';
import { RouteFocusModal } from '../../../components/route-modal';
import type { ProductAttribute } from '../../../../types/attribute';
import { ProductAttributeTypeEnum } from '../../../../types/attribute';
import { useTranslation } from 'react-i18next';
import AttributeCreatePage from '../product-create/page';
import type { ReactNode } from 'react';
import type {
	ColumnDef,
	ColumnFiltersState,
	SortingState,
} from '@tanstack/react-table';

import {
	flexRender,
	getCoreRowModel,
	useReactTable,
	getPaginationRowModel,
	getSortedRowModel,
	getFilteredRowModel,
} from '@tanstack/react-table';

import { ActionMenu } from '../../../components/common/action-menu';
import ProductAttributeOrganizeModal from '../components/product-attribute-organize-modal';

type ProductAttributeWithOnDelete = ProductAttribute & {
	onDelete: (attribute: ProductAttribute) => void;
};

type Action = {
	icon: ReactNode;
	label: string;
	disabled?: boolean;
} & (
	| {
			to: string;
			onClick?: never;
	  }
	| {
			onClick: () => void;
			to?: never;
	  }
);

const columns: ColumnDef<ProductAttributeWithOnDelete>[] = [
	{
		accessorKey: 'title',
		header: 'Title',
	},
	{
		accessorKey: 'code',
		header: 'Code',
	},
	{
		accessorKey: 'type',
		header: 'Type',
		cell: ({ row }) => (
			// @ts-ignore
			<span>{ProductAttributeTypeEnum[row.original.type]}</span>
		),
	},
	{
		accessorKey: 'status',
		header: 'Status',
		cell: ({ row }) => (
			<span className={row.original.status ? 'text-green-500' : 'text-red-500'}>
				{row.original.status ? 'Active' : 'Inactive'}
			</span>
		),
	},
	{
		accessorKey: 'rank',
		header: 'Rank',
	},
	{
		accessorKey: 'actions',
		header: '',
		cell: ({ row }) => {
			const attribute = row.original;
			const actions: Action[] = [
				{
					icon: <PencilSquare />,
					label: 'Edit',
					to: `/product-attributes/${attribute.id}/edit`,
				},
				{
					icon: <Trash />,
					label: 'Delete',
					onClick: () => attribute.onDelete(attribute),
				},
			];

			if (
				attribute.type === 'select' ||
				attribute.type === 'multiselect' ||
				attribute.type === 'swatch_visual' ||
				attribute.type === 'swatch_text'
			) {
				actions.push({
					icon: <CogSixTooth />,
					label: 'Manage Options',
					to: `/product-attributes/${attribute.id}/options`,
				});
			}

			return (
				<ActionMenu
					groups={[
						{
							actions: actions,
						},
					]}
				/>
			);
		},
	},
];

function DataTable({
	data,
	onDelete,
}: {
	data: ProductAttributeWithOnDelete[];
	onDelete: (attribute: ProductAttribute) => void;
}) {
	const [sorting, setSorting] = useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [globalFilter, setGlobalFilter] = useState('');

	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		onGlobalFilterChange: setGlobalFilter,
		state: {
			sorting,
			columnFilters,
			globalFilter,
		},
	});

	return (
		<div>
			<div className='flex items-center py-4'>
				<Input
					placeholder='Filter attributes...'
					value={globalFilter ?? ''}
					onChange={(event) => setGlobalFilter(String(event.target.value))}
					className='max-w-sm'
				/>
			</div>
			<Table>
				<Table.Header>
					{table.getHeaderGroups().map((headerGroup) => (
						<Table.Row key={headerGroup.id}>
							{headerGroup.headers.map((header) => (
								<Table.HeaderCell key={header.id}>
									{header.isPlaceholder
										? null
										: flexRender(
												header.column.columnDef.header,
												header.getContext(),
											)}
								</Table.HeaderCell>
							))}
						</Table.Row>
					))}
				</Table.Header>
				<Table.Body>
					{table.getRowModel().rows.map((row) => (
						<Table.Row key={row.id}>
							{row.getVisibleCells().map((cell) => (
								<Table.Cell key={cell.id}>
									{flexRender(cell.column.columnDef.cell, cell.getContext())}
								</Table.Cell>
							))}
						</Table.Row>
					))}
				</Table.Body>
			</Table>
			<div className='flex items-center justify-end space-x-2 py-4'>
				<Button
					variant='secondary'
					size='small'
					onClick={() => table.previousPage()}
					disabled={!table.getCanPreviousPage()}
				>
					Previous
				</Button>
				<Button
					variant='secondary'
					size='small'
					onClick={() => table.nextPage()}
					disabled={!table.getCanNextPage()}
				>
					Next
				</Button>
			</div>
		</div>
	);
}

const ProductAttributePage = () => {
	const { t } = useTranslation();
	const prompt = usePrompt();
	const [attributes, setAttributes] = useState<ProductAttribute[]>([]);
	const [loading, setLoading] = useState(true);
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [showOrganizeModal, setShowOrganizeModal] = useState(false);

	const fetchAttributes = useCallback(async () => {
		try {
			const response = await fetch('/admin/product-attributes', {
				credentials: 'include',
			});
			const data = await response.json();
			setAttributes(data.attributes);
		} catch (error) {
			console.error('Error fetching attributes:', error);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchAttributes();
	}, [fetchAttributes]);

	useEffect(() => {
		if (loading) {
			fetchAttributes();
		}
	}, [loading, fetchAttributes]);

	const handleDelete = async (attribute: ProductAttribute) => {
		const res = await prompt({
			title: 'Are you sure?',
			description: `Are you sure you want to delete the attribute: ${attribute.title}?`,
			confirmText: 'Delete',
			cancelText: 'Cancel',
		});

		if (!res) {
			return;
		}

		try {
			const response = await fetch(
				`/admin/product-attributes/${attribute.id}`,
				{
					method: 'DELETE',
					credentials: 'include',
				},
			);

			if (!response.ok) {
				throw new Error('Failed to delete attribute');
			}

			setAttributes((prevAttributes) =>
				prevAttributes.filter((attr) => attr.id !== attribute.id),
			);

			toast.success('Successfully deleted the attribute.', {
				description: `The attribute ${attribute.title} has been deleted.`,
			});
		} catch (error) {
			console.error('Error deleting attribute:', error);
			toast.error('Error deleting attribute.', {
				description: (error as Error).message,
			});
		}
	};

	return (
		<Container className='divide-y p-0 px-6'>
			<div className='flex items-center justify-between px-0 py-4'>
				<Heading>Product Attributes</Heading>
				<ActionMenu
					groups={[
						{
							actions: [
								{
									label: t('Create New Attribute'),
									onClick: () => setIsCreateModalOpen(true),
									icon: <Plus />,
								},
								{
									label: t('Edit Product Attribute Rank'),
									onClick: () => setShowOrganizeModal(true),
									icon: <PencilSquare />,
								},
							],
						},
					]}
				/>
			</div>
			{loading ? (
				<Text>Loading...</Text>
			) : attributes.length > 0 ? (
				<DataTable
					data={attributes.map((attr) => ({ ...attr, onDelete: handleDelete }))}
					onDelete={handleDelete}
				/>
			) : (
				<div className='flex h-[400px] w-full flex-col items-center justify-center gap-y-4'>
					<ExclamationCircle />
					<Text size='small' leading='compact' weight='plus'>
						{t('general.noRecordsTitle')}
					</Text>
					<Text size='small' className='text-ui-fg-muted'>
						{t('general.noRecordsMessage')}
					</Text>
				</div>
			)}
			{isCreateModalOpen && (
				<RouteFocusModal>
					<RouteFocusModal.Header>
						<div className='flex items-center justify-end gap-x-2'>
							<Button
								size='small'
								variant='secondary'
								onClick={() => setIsCreateModalOpen(false)}
							>
								{t('actions.cancel')}
							</Button>
						</div>
					</RouteFocusModal.Header>
					<AttributeCreatePage
						setIsCreateModalOpen={setIsCreateModalOpen}
						setLoading={setLoading}
					/>
				</RouteFocusModal>
			)}
			{showOrganizeModal && (
				<FocusModal
					open={showOrganizeModal}
					onOpenChange={() => {
						setShowOrganizeModal(!showOrganizeModal);
						fetchAttributes();
					}}
				>
					<ProductAttributeOrganizeModal />
				</FocusModal>
			)}
		</Container>
	);
};

export default ProductAttributePage;

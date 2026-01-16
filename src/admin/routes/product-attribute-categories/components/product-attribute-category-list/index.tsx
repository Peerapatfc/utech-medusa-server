import { PencilSquare, Plus, Trash } from '@medusajs/icons';
import { Container, Heading, toast, usePrompt } from '@medusajs/ui';
import type { ColumnDef } from '@tanstack/react-table';
import type { ReactNode } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ActionMenu } from '../../../../components/common/action-menu';
import { DataTable } from '../../../../components/table/data-table';
import {
	useDeleteProductAttributeCategory,
	useProductAttributeCategories,
} from '../../../../hooks/api/product-attribute-categories.tsx';
import { useProductAttributeCategoryTableQuery } from '../../../../hooks/table/query/use-product-attribute-category-table-query.tsx';
import { useDataTable } from '../../../../hooks/use-data-table';

type CategoryWithActions = {
	id: string;
	name: string;
	description?: string;
	rank?: number;
	status?: boolean;
	metadata?: Record<string, unknown>;
	onDelete: () => Promise<void>;
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

const PAGE_SIZE = 20;

const ProductAttributeCategoryList = () => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const prompt = usePrompt();
	// State to track the ID of the category being deleted
	const [categoryToDelete, setCategoryToDelete] = useState<{
		id: string;
		name: string;
	} | null>(null);

	// Use the fetch hook for getting categories
	const { searchParams } = useProductAttributeCategoryTableQuery({
		pageSize: PAGE_SIZE,
	});
	const {
		categories = [],
		count = 0,
		isLoading,
		refetch,
	} = useProductAttributeCategories(searchParams);

	// Use the delete mutation hook with dynamic ID
	const deleteMutation = useDeleteProductAttributeCategory(
		categoryToDelete?.id || '',
		{
			onSuccess: () => {
				if (categoryToDelete) {
					toast.success(
						`Category "${categoryToDelete.name}" deleted successfully`,
					);
				}
				refetch();
				setCategoryToDelete(null);
			},
			onError: (error) => {
				console.error('Error deleting category:', error);
				toast.error(
					`Failed to delete category: ${error.message || 'Unknown error'}`,
				);
				setCategoryToDelete(null);
			},
		},
	);

	const handleDelete = useCallback(
		async (categoryId: string, categoryName: string) => {
			const res = await prompt({
				title: `Delete ${categoryName}`,
				description:
					'Are you sure you want to delete this product attribute category? This action cannot be undone',
				confirmText: 'Yes, delete',
				cancelText: 'Cancel',
			});

			if (!res) {
				return;
			}

			setCategoryToDelete({ id: categoryId, name: categoryName });
		},
		[prompt],
	);

	useEffect(() => {
		if (categoryToDelete && !deleteMutation.isPending) {
			deleteMutation.mutate();
		}
	}, [categoryToDelete, deleteMutation.isPending, deleteMutation.mutate]);

	const categoriesWithActions: CategoryWithActions[] = categories.map(
		(category) => ({
			...category,
			id: category.id || '', // Ensure id is never undefined
			onDelete: () => handleDelete(category.id || '', category.name || ''),
		}),
	);

	const columns: ColumnDef<CategoryWithActions>[] = [
		{
			accessorKey: 'name',
			header: 'Name',
			cell: ({ row }) => (
				<div className='flex items-center max-w-[400px]'>
					<span className='truncate'>{row.original.name}</span>
				</div>
			),
		},
		{
			accessorKey: 'description',
			header: 'Description',
			cell: ({ row }) => (
				<div className='flex items-center max-w-[400px]'>
					<span className='truncate'>{row.original.description || '-'}</span>
				</div>
			),
		},
		{
			id: 'actions',
			cell: ({ row }) => {
				const category = row.original;

				const actions: Action[] = [
					{
						label: 'Edit',
						icon: <PencilSquare />,
						to: `/product-attribute-categories/${category.id}/edit`,
					},
					{
						label: 'Delete',
						icon: <Trash />,
						onClick: () => category.onDelete(),
					},
				];

				return (
					<div className='flex justify-end'>
						<ActionMenu groups={[{ actions }]} />
					</div>
				);
			},
		},
	];

	const { table } = useDataTable({
		data: categoriesWithActions,
		columns,
		count: count,
		pageSize: PAGE_SIZE,
		enablePagination: true,
		getRowId: (row) => row.id,
	});

	return (
		<Container className='divide-y p-0'>
			<div className='flex items-center justify-between px-6 py-4'>
				<Heading>{t('Product Attribute Categories')}</Heading>
				<ActionMenu
					groups={[
						{
							actions: [
								{
									label: t('Create Product Attribute Category'),
									onClick: () =>
										navigate('/product-attribute-categories/create'),
									icon: <Plus />,
								},
							],
						},
					]}
				/>
			</div>
			<DataTable
				table={table}
				columns={columns}
				count={count}
				isLoading={isLoading || deleteMutation.isPending}
				pageSize={PAGE_SIZE}
				pagination
				noRecords={{
					title: 'No categories found',
					message: 'No product attribute categories exist yet.',
				}}
			/>
		</Container>
	);
};

export default ProductAttributeCategoryList;

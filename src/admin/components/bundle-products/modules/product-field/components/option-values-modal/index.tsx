import { Button, Container, usePrompt } from '@medusajs/ui';
import { PencilSquare, Plus, Trash } from '@medusajs/icons';
import { DataTable } from '../../../../../table/data-table';
import {
	createColumnHelper,
	type RowSelectionState,
} from '@tanstack/react-table';
import type { z } from 'zod';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { FieldArrayWithId } from 'react-hook-form';
import { useDataTable } from '../../../../../../hooks/use-data-table';
import {
	type CustomOptionSchema,
	type ProductRecordSchema,
	Tab,
} from '../../../../common/schemas';

const PAGE_SIZE = 10;

const OptionValuesModal = ({
	isView,
	handleShowAddProductModal,
	nestIndex,
	handleRemove,
	fields,
	isLoading,
}: {
	isView: boolean;
	handleShowAddProductModal: (indexBundle: number, tab: Tab) => void;
	nestIndex: number;
	handleRemove: (index: number) => void;
	fields: FieldArrayWithId<
		z.infer<typeof CustomOptionSchema>,
		`bundles.${number}.products`,
		'id'
	>[];
	isLoading: boolean;
}) => {
	const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

	const columns = useColumns({
		handleRemove,
		isView,
	});
	const count = fields.length;

	const { table } = useDataTable({
		data: fields,
		count,
		columns,
		enablePagination: true,
		enableRowSelection: true,
		pageSize: PAGE_SIZE,
		rowSelection: {
			state: rowSelection,
			updater: setRowSelection,
		},
	});

	return (
		<Container className='divide-y p-0'>
			{!isView && (
				<div className='flex items-center justify-end gap-x-2 px-6 py-4'>
					<Button
						type='button'
						onClick={() => handleShowAddProductModal(nestIndex, Tab.VARIANT)}
						disabled={isView}
						variant='secondary'
						size='small'
					>
						<PencilSquare /> Edit
					</Button>
					<Button
						type='button'
						onClick={() => handleShowAddProductModal(nestIndex, Tab.PRODUCT)}
						disabled={isView}
						variant='secondary'
						size='small'
					>
						<Plus /> Add
					</Button>
				</div>
			)}
			<DataTable
				table={table}
				columns={columns}
				count={count}
				pageSize={PAGE_SIZE}
				isLoading={isLoading}
				orderBy={[
					{ key: 'title', label: 'Title' },
					{ key: 'productTitle', label: 'Product' },
					{ key: 'variantTitle', label: 'Variant' },
				]}
				pagination
				search
			/>
		</Container>
	);
};

const columnHelper = createColumnHelper<z.infer<typeof ProductRecordSchema>>();

const useColumns = ({
	handleRemove,
	isView,
}: {
	handleRemove: (index: number) => void;
	isView: boolean;
}) => {
	return useMemo(
		() => [
			columnHelper.accessor('productTitle', {
				id: 'productTitle',
				header: () => 'Product',
			}),
			columnHelper.accessor('variantTitle', {
				id: 'variantTitle',
				header: () => 'Variant',
			}),
			columnHelper.display({
				id: 'title',
				header: () => 'Custom Title',
				cell: ({ row }) => row.original.title,
			}),
			columnHelper.accessor('price', {
				id: 'price',
				header: () => 'Custom Price',
			}),
			columnHelper.display({
				id: 'actions',
				header: () => 'Delete',
				cell: ({ row }) => (
					<ProductRowAction
						product={row.original}
						remove={handleRemove}
						isView={isView}
					/>
				),
			}),
		],
		[handleRemove, isView],
	);
};

const ProductRowAction = ({
	product,
	remove,
	isView,
}: {
	product: z.infer<typeof ProductRecordSchema>;
	remove: (index: number) => void;
	isView: boolean;
}) => {
	const { t } = useTranslation();
	const prompt = usePrompt();

	const handleDelete = async () => {
		const res = await prompt({
			title: t('general.areYouSure'),
			description:
				'You are about to delete the variant for 1 variant in the custom option. This action cannot be undone.',
			confirmText: t('actions.delete'),
			cancelText: t('actions.cancel'),
		});

		if (!res) {
			return;
		}

		if (typeof product.index !== 'undefined') {
			remove(product.index);
		}
	};

	return (
		<Button
			type='button'
			onClick={handleDelete}
			disabled={isView}
			variant='transparent'
		>
			<Trash />
		</Button>
	);
};

export default OptionValuesModal;

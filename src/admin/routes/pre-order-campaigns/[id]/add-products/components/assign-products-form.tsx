import { zodResolver } from '@hookform/resolvers/zod';
import type { HttpTypes } from '@medusajs/types';
import { Button, Checkbox, Hint, toast } from '@medusajs/ui';
import { useParams } from 'react-router-dom';
import {
	type OnChangeFn,
	type RowSelectionState,
	createColumnHelper,
} from '@tanstack/react-table';
import { useCallback, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { RouteFocusModal } from '../../../../../components/route-modal';
import { useRouteModal } from '../../../../../components/route-modal';
import { DataTable } from '../../../../../components/table/data-table/data-table';
import { KeyboundForm } from '../../../../../components/utilities/keybound-form';
import { useProductTableColumns } from '../../../../../hooks/table/columns/use-product-table-columns';
import { useProductTableFilters } from '../../../../../hooks/table/filters/use-product-table-filters';
import { useProductTableQuery } from '../../../../../hooks/table/query/use-product-table-query';
import { useDataTable } from '../../../../../hooks/use-data-table';
import {
	useAddProductsToPreOrderPreOrderTemplate,
	useUnAddedProductsTemplates,
} from '../../../../../hooks/api/pre-order-template';

const PAGE_SIZE = 50;
const PREFIX = 'p';

const AddProductsToPreOrderSchema = z.object({
	product_ids: z.array(z.string()),
});

export const AddProductsToPreOrderForm = () => {
	const { id } = useParams();
	if (!id) {
		return null;
	}

	const { t } = useTranslation();
	const { handleSuccess } = useRouteModal();
	const form = useForm<z.infer<typeof AddProductsToPreOrderSchema>>({
		defaultValues: {
			product_ids: [],
		},
		resolver: zodResolver(AddProductsToPreOrderSchema),
	});

	const [selection, setSelection] = useState<RowSelectionState>({});

	const updater: OnChangeFn<RowSelectionState> = useCallback(
		(newSelection) => {
			const value =
				typeof newSelection === 'function'
					? newSelection(selection)
					: newSelection;

			form.setValue('product_ids', Object.keys(value), {
				shouldDirty: true,
				shouldTouch: true,
			});

			setSelection(value);
		},
		[form, selection],
	);

	const { searchParams: _searchParams, raw } = useProductTableQuery({
		pageSize: PAGE_SIZE,
		prefix: PREFIX,
		defaultStatus: ['published'],
	});

	const { products: data, count, isPending } = useUnAddedProductsTemplates(id);

	const filters = useProductTableFilters(['categories']);

	const columns = useColumns();

	const { table } = useDataTable({
		data,
		columns,
		getRowId: (original) => original.id,
		count,
		pageSize: PAGE_SIZE,
		prefix: PREFIX,
		enableRowSelection: (_row) => true,
		enablePagination: true,
		rowSelection: {
			state: selection,
			updater,
		},
	});

	const { mutateAsync } = useAddProductsToPreOrderPreOrderTemplate({});

	const handleSubmit = form.handleSubmit(async (data) => {
		const payload = {
			id,
			product_ids: data.product_ids,
		};

		try {
			await mutateAsync(payload);
			toast.success('Products were successfully added to Pre-order.');
			// window.dispatchEvent(new CustomEvent('relatedProductsUpdated'));
			handleSuccess(`/pre-order-campaigns/${id}`);
		} catch (error) {
			toast.error((error as Error).message);
		}
	});

	return (
		<RouteFocusModal.Form form={form}>
			<KeyboundForm
				onSubmit={handleSubmit}
				className='flex h-full flex-col overflow-hidden'
			>
				<RouteFocusModal.Header>
					<div className='flex items-center justify-end gap-x-2'>
						{form.formState.errors.product_ids && (
							<Hint variant='error'>
								{form.formState.errors.product_ids.message}
							</Hint>
						)}
						<RouteFocusModal.Close asChild>
							<Button size='small' variant='secondary'>
								{t('actions.cancel')}
							</Button>
						</RouteFocusModal.Close>
						<Button size='small' type='submit'>
							{t('actions.save')}
						</Button>
					</div>
				</RouteFocusModal.Header>
				<RouteFocusModal.Body>
					<DataTable
						table={table}
						columns={columns}
						pageSize={PAGE_SIZE}
						count={count}
						queryObject={raw}
						filters={filters}
						orderBy={[
							{ key: 'title', label: t('fields.title') },
							{ key: 'created_at', label: t('fields.createdAt') },
							{ key: 'updated_at', label: t('fields.updatedAt') },
						]}
						prefix={PREFIX}
						isLoading={isPending}
						layout='fill'
						pagination
						search='autofocus'
					/>
				</RouteFocusModal.Body>
			</KeyboundForm>
		</RouteFocusModal.Form>
	);
};

const columnHelper = createColumnHelper<HttpTypes.AdminProduct>();

const useColumns = () => {
	const base = useProductTableColumns();
	return useMemo(
		() => [
			columnHelper.display({
				id: 'select',
				header: ({ table }) => (
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
				),
				cell: ({ row }) => {
					const isPreSelected = !row.getCanSelect();
					const isSelected = row.getIsSelected() || isPreSelected;

					return (
						<Checkbox
							disabled={isPreSelected}
							checked={isSelected}
							onCheckedChange={(value) => row.toggleSelected(!!value)}
							onClick={(e) => e.stopPropagation()}
						/>
					);
				},
			}),
			...base,
		],
		[base],
	);
};

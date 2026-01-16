import { zodResolver } from '@hookform/resolvers/zod';
import type { HttpTypes } from '@medusajs/types';
import { Button, Checkbox, Hint, toast } from '@medusajs/ui';
import { useQueryClient } from '@tanstack/react-query';
import {
	type OnChangeFn,
	type RowSelectionState,
	createColumnHelper,
} from '@tanstack/react-table';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import {
	RouteFocusModal,
	useRouteModal,
} from '../../../../../components/route-modal';
import { DataTable } from '../../../../../components/table/data-table/data-table';
import { KeyboundForm } from '../../../../../components/utilities/keybound-form';
import {
	productsQueryKeys,
	useProduct,
	useProducts,
	useUpdateProduct,
} from '../../../../../hooks/api/products';
import { useProductTableColumns } from '../../../../../hooks/table/columns/use-product-table-columns';
import { useProductTableFilters } from '../../../../../hooks/table/filters/use-product-table-filters';
import { useProductTableQuery } from '../../../../../hooks/table/query/use-product-table-query';
import { useDataTable } from '../../../../../hooks/use-data-table';

const PAGE_SIZE = 50;
const PREFIX = 'p';

type EditCategoryProductsFormProps = {
	productId?: string;
};

const EditCategoryProductsSchema = z.object({
	product_ids: z.array(z.string()),
});

export const AssignProductsForm = ({
	productId,
}: EditCategoryProductsFormProps) => {
	const { t } = useTranslation();
	const { handleSuccess } = useRouteModal();
	const queryClient = useQueryClient();

	const form = useForm<z.infer<typeof EditCategoryProductsSchema>>({
		defaultValues: {
			product_ids: [],
		},
		resolver: zodResolver(EditCategoryProductsSchema),
	});

	const { product } = useProduct(productId ?? '');

	const [selection, setSelection] = useState<RowSelectionState>({});

	useEffect(() => {
		if (product?.metadata?.related_products) {
			const relatedProductIds = product.metadata.related_products as string[];
			const newSelection = relatedProductIds.reduce((acc, id) => {
				acc[id] = true;
				return acc;
			}, {} as RowSelectionState);
			setSelection(newSelection);
			form.setValue('product_ids', relatedProductIds);
		}
	}, [product, form]);

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

	const { searchParams, raw } = useProductTableQuery({
		pageSize: PAGE_SIZE,
		prefix: PREFIX,
		defaultStatus: ['published'],
		productId,
	});

	const { products: data, count, isPending } = useProducts(searchParams);

	const filters = useProductTableFilters(['categories']);

	const columns = useColumns(productId);

	const { table } = useDataTable({
		data,
		columns,
		getRowId: (original) => original.id,
		count,
		pageSize: PAGE_SIZE,
		prefix: PREFIX,
		enableRowSelection: (row) => row.original.id !== productId,
		enablePagination: true,
		rowSelection: {
			state: selection,
			updater,
		},
	});

	const { mutateAsync } = useUpdateProduct(productId ?? '');

	const handleSubmit = form.handleSubmit(async (data) => {
		// Get the existing related products order
		const existingRelatedProducts =
			(product?.metadata?.related_products as string[]) || [];

		// Create a set of existing IDs for faster lookup
		const existingIds = new Set(existingRelatedProducts);

		// Get the newly selected IDs that weren't previously related
		const newlySelectedIds = data.product_ids.filter(
			(id) => !existingIds.has(id),
		);

		// Keep existing products in their original order, remove any unselected ones
		const orderedProductIds = existingRelatedProducts
			.filter((id) => data.product_ids.includes(id))
			.concat(newlySelectedIds);

		// Update metadata with ordered product IDs
		const updatedMetadata = {
			...product?.metadata,
			related_products: orderedProductIds,
		};

		try {
			await mutateAsync({ metadata: updatedMetadata });
			toast.success('Products were successfully assigned to related products.');
			//window.dispatchEvent(new CustomEvent('relatedProductsUpdated'));
			handleSuccess();
			if (productId) {
				queryClient.invalidateQueries({
					queryKey: productsQueryKeys.detail(productId),
				});
			}
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

const useColumns = (productId?: string) => {
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
					const isSelected = row.getIsSelected();
					const isCurrentProduct = row.original.id === productId;

					if (isCurrentProduct) {
						return null; // Hide checkbox for the current product
					}

					return (
						<Checkbox
							checked={isSelected}
							onCheckedChange={(value) => row.toggleSelected(!!value)}
							onClick={(e) => e.stopPropagation()}
						/>
					);
				},
			}),
			...base,
		],
		[base, productId],
	);
};

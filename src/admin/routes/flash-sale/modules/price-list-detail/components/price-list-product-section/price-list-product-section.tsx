import { PencilSquare, Plus, Trash } from '@medusajs/icons';
import type { HttpTypes } from '@medusajs/types';
import { Checkbox, Container, Heading, toast, usePrompt } from '@medusajs/ui';
import { keepPreviousData } from '@tanstack/react-query';
import {
	type RowSelectionState,
	createColumnHelper,
} from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { ActionMenu } from '../../../../../../components/common/action-menu';
import { DataTable } from '../../../../../../components/table/data-table';
import {
	removePriceListLinkProducts,
	usePriceListLinkProducts,
} from '../../../../../../hooks/api/flash-sales';
import { useProducts } from '../../../../../../hooks/api/products';
import { useProductTableColumns } from '../../../../../../hooks/table/columns/use-product-table-columns';
import { useProductTableFilters } from '../../../../../../hooks/table/filters/use-product-table-filters';
import { useProductTableQuery } from '../../../../../../hooks/table/query/use-product-table-query';
import { useDataTable } from '../../../../../../hooks/use-data-table';

type PriceListProductSectionProps = {
	priceList: HttpTypes.AdminPriceList;
};

const PAGE_SIZE = 10;
const PREFIX = 'p';

export const PriceListProductSection = ({
	priceList,
}: PriceListProductSectionProps) => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const prompt = usePrompt();

	const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

	const { searchParams, raw } = useProductTableQuery({
		pageSize: PAGE_SIZE,
		prefix: PREFIX,
	});
	const { products, count, isLoading, isError, error } = useProducts(
		{
			...searchParams,
			price_list_id: [priceList.id],
		},
		{
			placeholderData: keepPreviousData,
		},
	);

	const filters = useProductTableFilters();
	const columns = useColumns(priceList);
	const { mutateAsync } = usePriceListLinkProducts(priceList.id);

	const { table } = useDataTable({
		data: products || [],
		count,
		columns,
		enablePagination: true,
		enableRowSelection: true,
		pageSize: PAGE_SIZE,
		getRowId: (row) => row.id,
		rowSelection: {
			state: rowSelection,
			updater: setRowSelection,
		},
		prefix: PREFIX,
	});

	const handleDelete = async () => {
		const res = await prompt({
			title: t('general.areYouSure'),
			description: t('priceLists.products.delete.confirmation', {
				count: Object.keys(rowSelection).length,
			}),
			confirmText: t('actions.delete'),
			cancelText: t('actions.cancel'),
		});

		if (!res) {
			return;
		}

		mutateAsync(
			{
				remove: Object.keys(rowSelection),
			},
			{
				onSuccess: () => {
					removePriceListLinkProducts(priceList.id, Object.keys(rowSelection))
						.then(() => {
							toast.success(
								t('priceLists.products.delete.successToast', {
									count: Object.keys(rowSelection).length,
								}),
							);

							setRowSelection({});
							setTimeout(() => {
								window.location.reload();
							}, 500);
						})
						.catch((e) => {
							toast.error(e.message);
						});
				},
				onError: (e) => {
					toast.error(e.message);
				},
			},
		);
	};

	const handleEdit = async () => {
		const ids = Object.keys(rowSelection).join(',');

		navigate(`products/edit?ids[]=${ids}`);
	};

	if (isError) {
		throw error;
	}

	return (
		<Container className='divide-y p-0'>
			<div className='flex items-center justify-between px-6 py-4'>
				<Heading>{t('priceLists.products.header')}</Heading>
				<ActionMenu
					groups={[
						{
							actions: [
								{
									label: t('priceLists.products.actions.addProducts'),
									to: 'products/add',
									icon: <Plus />,
								},
								{
									label: t('priceLists.products.actions.editPrices'),
									to: 'products/edit',
									icon: <PencilSquare />,
								},
							],
						},
					]}
				/>
			</div>
			<DataTable
				table={table}
				filters={filters}
				columns={columns}
				count={count}
				pageSize={PAGE_SIZE}
				isLoading={isLoading}
				navigateTo={(row) => `/products/${row.original.id}`}
				orderBy={[
					{ key: 'title', label: t('fields.title') },
					{ key: 'created_at', label: t('fields.createdAt') },
					{ key: 'updated_at', label: t('fields.updatedAt') },
				]}
				commands={[
					{
						action: handleEdit,
						label: t('actions.edit'),
						shortcut: 'e',
					},
					{
						action: handleDelete,
						label: t('actions.delete'),
						shortcut: 'd',
					},
				]}
				pagination
				search
				prefix={PREFIX}
				queryObject={raw}
			/>
		</Container>
	);
};

const ProductRowAction = ({
	product,
	priceList,
}: {
	product: HttpTypes.AdminProduct;
	priceList: HttpTypes.AdminPriceList;
}) => {
	const { t } = useTranslation();
	const prompt = usePrompt();
	const { mutateAsync } = usePriceListLinkProducts(priceList.id);

	const handleDelete = async () => {
		const res = await prompt({
			title: t('general.areYouSure'),
			description: t('priceLists.products.delete.confirmation', {
				count: 1,
			}),
			confirmText: t('actions.delete'),
			cancelText: t('actions.cancel'),
		});

		if (!res) {
			return;
		}

		mutateAsync(
			{
				remove: [product.id],
			},
			{
				onSuccess: () => {
					removePriceListLinkProducts(priceList.id, [product.id])
						.then(() => {
							toast.success(
								t('priceLists.products.delete.successToast', {
									count: 1,
								}),
							);
							setTimeout(() => {
								window.location.reload();
							}, 500);
						})
						.catch((e) => {
							toast.error(e.message);
						});
				},
				onError: (e) => {
					toast.error(e.message);
				},
			},
		);
	};

	return (
		<ActionMenu
			groups={[
				{
					actions: [
						{
							icon: <PencilSquare />,
							label: t('priceLists.products.actions.editPrices'),
							to: `products/edit?ids[]=${product.id}`,
						},
					],
				},
				{
					actions: [
						{
							icon: <Trash />,
							label: t('actions.remove'),
							onClick: handleDelete,
						},
					],
				},
			]}
		/>
	);
};

const columnHelper = createColumnHelper<HttpTypes.AdminProduct>();

const useColumns = (priceList: HttpTypes.AdminPriceList) => {
	const base = useProductTableColumns();

	return useMemo(
		() => [
			columnHelper.display({
				id: 'select',
				header: ({ table }) => {
					return (
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
					);
				},
				cell: ({ row }) => {
					return (
						<Checkbox
							checked={row.getIsSelected()}
							onCheckedChange={(value) => row.toggleSelected(!!value)}
							onClick={(e) => {
								e.stopPropagation();
							}}
						/>
					);
				},
			}),
			...base,
			columnHelper.display({
				id: 'actions',
				cell: ({ row }) => (
					<ProductRowAction product={row.original} priceList={priceList} />
				),
			}),
		],
		[base, priceList],
	);
};

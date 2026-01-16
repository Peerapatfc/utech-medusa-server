import { keepPreviousData } from '@tanstack/react-query';
import { type Dispatch, type SetStateAction, useMemo } from 'react';
import { Checkbox, Tooltip } from '@medusajs/ui';

import { useTranslation } from 'react-i18next';
import { useProducts } from '../../../../hooks/api/products';
import { useProductTableColumns } from '../../../../hooks/table/columns/use-product-table-columns';
import { useProductTableFilters } from '../../common/hooks/table/filters/use-product-table-filters';
import { useProductTableQuery } from '../../../../hooks/table/query/use-product-table-query';
import { useDataTable } from '../../../../hooks/use-data-table';
import { DataTable } from '../../../table/data-table';
import {
	type OnChangeFn,
	type RowSelectionState,
	createColumnHelper,
} from '@tanstack/react-table';
import type { HttpTypes } from '@medusajs/framework/types';

const PAGE_SIZE = 15;
const PREFIX = 'ctp';

export const ProductLists = ({
	rowSelection,
	setRowSelection,
	variantIdMap,
}: {
	rowSelection: RowSelectionState;
	setRowSelection: Dispatch<SetStateAction<RowSelectionState>>;
	variantIdMap: Record<string, boolean>;
}) => {
	const { t } = useTranslation();

	const columns = useColumns();
	const filters = useProductTableFilters();

	const { searchParams, raw } = useProductTableQuery({
		pageSize: PAGE_SIZE,
		prefix: PREFIX,
	});
	const { products, count, isLoading } = useProducts(
		{
			...searchParams,
			status: ['published'],
		},
		{
			placeholderData: keepPreviousData,
		},
	);

	const updater: OnChangeFn<RowSelectionState> = (fn) => {
		const state = typeof fn === 'function' ? fn(rowSelection) : fn;
		setRowSelection(state);
	};

	const { table } = useDataTable({
		data: products || [],
		columns,
		count,
		enablePagination: true,
		enableRowSelection: (row) => {
			return (
				!!row.original.variants?.length &&
				!row.original.variants?.some((v) => variantIdMap[v.id])
			);
		},
		getRowId: (row) => row.id,
		rowSelection: {
			state: rowSelection,
			updater,
		},
		pageSize: PAGE_SIZE,
		meta: {
			variantIdMap,
		},
		prefix: PREFIX,
	});

	return (
		<div className='flex size-full flex-col'>
			<DataTable
				table={table}
				columns={columns}
				filters={filters}
				pageSize={PAGE_SIZE}
				prefix={PREFIX}
				count={count}
				isLoading={isLoading}
				layout='fill'
				orderBy={[
					{ key: 'title', label: t('fields.title') },
					{ key: 'status', label: t('fields.status') },
					{ key: 'created_at', label: t('fields.createdAt') },
					{ key: 'updated_at', label: t('fields.updatedAt') },
				]}
				pagination
				search
				queryObject={raw}
			/>
		</div>
	);
};

const columnHelper = createColumnHelper<HttpTypes.AdminProduct>();

const useColumns = () => {
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
				cell: ({ row, table }) => {
					const { variantIdMap } = table.options.meta as {
						variantIdMap: Record<string, boolean>;
					};

					const isPreselected = row.original.variants?.some(
						(v) => variantIdMap[v.id],
					);
					const isDisabled = !row.getCanSelect() || isPreselected;
					const isChecked = row.getIsSelected() || isPreselected;

					const Component = (
						<Checkbox
							checked={isChecked}
							disabled={isDisabled}
							onCheckedChange={(value) => row.toggleSelected(!!value)}
							onClick={(e) => {
								e.stopPropagation();
							}}
						/>
					);

					if (isPreselected) {
						return (
							<Tooltip content='This product is already in the price list'>
								{Component}
							</Tooltip>
						);
					}

					if (isDisabled) {
						return (
							<Tooltip content='This product has no variants'>
								{Component}
							</Tooltip>
						);
					}

					return Component;
				},
			}),
			...base,
		],
		[base],
	);
};

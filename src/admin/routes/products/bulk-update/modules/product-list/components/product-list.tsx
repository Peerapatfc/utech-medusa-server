import { keepPreviousData } from '@tanstack/react-query';
import type { OnChangeFn, RowSelectionState } from '@tanstack/react-table';
import { useState } from 'react';
import { type UseFormReturn, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { DataTable } from '../../../../../../components/table/data-table';
import { useProducts } from '../../../../../../hooks/api/products';
import { useProductTableFilters } from '../../../../../../hooks/table/filters/use-product-table-filters';
import { useProductTableQuery } from '../../../../../../hooks/table/query/use-product-table-query';
import { useDataTable } from '../../../../../../hooks/use-data-table';
import { useColumns } from '../hooks/use-product-table-columns';
import type { ProductsType, UpdateProductsVariantsType } from '../schema';
const PAGE_SIZE = 20;

interface Props {
	form: UseFormReturn<UpdateProductsVariantsType>;
}
function getInitialSelection(products: { id: string }[]) {
	return products.reduce((acc, curr) => {
		acc[curr.id] = true;
		return acc;
	}, {} as RowSelectionState);
}

const ProductListTable = ({ form }: Props) => {
	const { control, setValue } = form;
	const { t } = useTranslation();
	const selectedIds =
		useWatch({
			control,
			name: 'product_ids',
		}) ?? [];

	const productRecords = useWatch({
		control,
		name: 'products',
	});

	const [rowSelection, setRowSelection] = useState<RowSelectionState>(
		getInitialSelection(selectedIds),
	);

	const { searchParams, raw } = useProductTableQuery({
		pageSize: PAGE_SIZE,
	});
	const { products, count, isLoading } = useProducts(searchParams, {
		placeholderData: keepPreviousData,
	});

	const updater: OnChangeFn<RowSelectionState> = (fn) => {
		const state = typeof fn === 'function' ? fn(rowSelection) : fn;
		setRowSelection(state);

		const ids = Object.keys(state);
		const updateIds = ids.map((id) => ({ id }));
		setValue('product_ids', updateIds, {
			shouldDirty: true,
			shouldTouch: true,
		});

		const productRecordKeys = Object.keys(productRecords);
		const updatedRecords = productRecordKeys.reduce((acc, key) => {
			if (ids.includes(key)) {
				acc[key] = productRecords[key];
			}
			return acc;
		}, {} as ProductsType);

		setValue('products', updatedRecords, {
			shouldDirty: true,
			shouldTouch: true,
		});
	};

	const columns = useColumns();
	const filter = useProductTableFilters();
	const { table } = useDataTable({
		data: products ?? [],
		columns,
		count,
		enablePagination: true,
		enableRowSelection: true,
		getRowId: (row) => row.id,
		rowSelection: {
			state: rowSelection,
			updater,
		},
		meta: {
			variantIdMap: rowSelection,
		},
		pageSize: PAGE_SIZE,
	});

	return (
		<div className='flex size-full flex-col'>
			<DataTable
				table={table}
				columns={columns}
				count={count}
				filters={filter}
				isLoading={isLoading}
				layout='fill'
				pageSize={PAGE_SIZE}
				pagination
				orderBy={[
					{ key: 'title', label: t('fields.title') },
					{ key: 'status', label: t('fields.status') },
					{ key: 'created_at', label: t('fields.createdAt') },
					{ key: 'updated_at', label: t('fields.updatedAt') },
				]}
				queryObject={raw}
				search='autofocus'
			/>
		</div>
	);
};

export default ProductListTable;

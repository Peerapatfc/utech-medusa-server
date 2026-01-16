import type { HttpTypes } from '@medusajs/framework/types';
import { Checkbox, Tooltip } from '@medusajs/ui';
import { createColumnHelper } from '@tanstack/react-table';
import { useMemo } from 'react';
import { useProductTableColumns } from '../../../../../../hooks/table/columns/use-product-table-columns';

const columnHelper = createColumnHelper<HttpTypes.AdminProduct>();

export const useColumns = () => {
	// const { t } = useTranslation();
	const base = useProductTableColumns();

	const columns = useMemo(
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
					const isPreSelected = row.original.variants?.some(
						(v) => variantIdMap[v.id],
					);
					const isDisabled = !row.getCanSelect() || isPreSelected;
					const isChecked = row.getIsSelected() || isPreSelected;

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
					if (isPreSelected) {
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
	return columns;
};

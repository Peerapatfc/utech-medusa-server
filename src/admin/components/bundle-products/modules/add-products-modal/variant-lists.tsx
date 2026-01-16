import { useProducts } from '../../../../hooks/api/products';
import type { ColumnDef, RowSelectionState } from '@tanstack/react-table';
import { createDataGridHelper, DataGrid } from '../../../data-grid';
import { useTranslation } from 'react-i18next';
import { useEffect, useMemo, useState } from 'react';
import {
	Controller,
	type UseFormGetValues,
	type UseFormReturn,
	type UseFormSetValue,
	type UseFormWatch,
} from 'react-hook-form';
import { Thumbnail } from '../../../common/thumbnail';
import { clx, Switch } from '@medusajs/ui';
import type { HttpTypes } from '@medusajs/framework/types';
import type { z } from 'zod';
import type { ProductRecordSchema } from '../../common/schemas';

interface ProductRecordForm extends z.infer<typeof ProductRecordSchema> {
	isSelected: boolean;
}

type PriceListPricesAddPricesFormProps = {
	rowSelection: RowSelectionState;
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	form: UseFormReturn<{ products: ProductRecordForm[] }, any, undefined>;
	productRecords: z.infer<typeof ProductRecordSchema>[];
	selectType: string;
};

export const VariantLists = ({
	rowSelection,
	form,
	productRecords,
	selectType,
}: PriceListPricesAddPricesFormProps) => {
	const ids = Object.keys(rowSelection).map((key) => key);

	const { products, isLoading, isError, error } = useProducts({
		id: ids,
		limit: ids.length,
		fields:
			'title,thumbnail,*variants,*variants.inventory_items,*variants.inventory_items.inventory,*variants.inventory_items.inventory.location_levels',
	});

	const { setValue, getValues, watch } = form;

	const columns = useVariantListGridColumns({
		setValue,
		getValues,
		watch,
		form,
		selectType,
	});

	if (isError) {
		throw error;
	}

	useEffect(() => {
		const variants: ProductRecordForm[] = [];
		let index = 0;
		const mapVariants = (products: HttpTypes.AdminProduct[]) => {
			for (const product of products) {
				if (!product.variants) {
					continue;
				}
				for (const variant of product.variants) {
					const value = productRecords.find(
						(product) => product.variantId === variant.id,
					);
					variants.push({
						index,
						isSelected: typeof value !== 'undefined',
						title: value?.title ?? '',
						productId: product.id,
						productTitle: product.title,
						variantId: variant.id,
						variantTitle: variant.title ?? '',
						price:
							typeof value?.price !== 'undefined' ? value?.price : undefined,
					});
					index++;
				}
			}
		};
		if (products) {
			mapVariants(products);
		}
		setValue('products', variants);
	}, [setValue, productRecords, products]);

	return (
		<div className='flex size-full flex-col divide-y overflow-hidden'>
			<DataGrid
				isLoading={isLoading}
				columns={columns}
				data={products}
				getSubRows={(row) => {
					if (isProductRow(row) && row.variants) {
						return row.variants;
					}
				}}
				state={form}
			/>
		</div>
	);
};

const isProductRow = (
	row: HttpTypes.AdminProduct | HttpTypes.AdminProductVariant,
): row is HttpTypes.AdminProduct => {
	return 'variants' in row;
};

const columnHelper = createDataGridHelper<
	HttpTypes.AdminProduct | HttpTypes.AdminProductVariant,
	ProductRecordForm
>();

export const useVariantListGridColumns = ({
	setValue,
	getValues,
	watch,
	form,
	selectType,
}: {
	setValue: UseFormSetValue<{
		products: ProductRecordForm[];
	}>;
	getValues: UseFormGetValues<{
		products: ProductRecordForm[];
	}>;
	watch: UseFormWatch<{
		products: ProductRecordForm[];
	}>;
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	form: UseFormReturn<{ products: ProductRecordForm[] }, any, undefined>;
	selectType: string;
}) => {
	const { t } = useTranslation();

	const colDefs: ColumnDef<
		HttpTypes.AdminProduct | HttpTypes.AdminProductVariant
	>[] = useMemo(() => {
		return [
			columnHelper.column({
				id: t('fields.title'),
				header: t('fields.title'),
				cell: (context) => {
					const entity = context.row.original;
					if (isProductRow(entity)) {
						return (
							<DataGrid.ReadonlyCell context={context}>
								<div className='flex h-full w-full items-center gap-x-2 overflow-hidden'>
									<Thumbnail src={entity.thumbnail} size='small' />
									<span className='truncate'>{entity.title}</span>
								</div>
							</DataGrid.ReadonlyCell>
						);
					}

					return (
						<DataGrid.ReadonlyCell context={context}>
							<div className='flex h-full w-full items-center gap-x-2 overflow-hidden'>
								<span className='truncate'>{entity.title}</span>
							</div>
						</DataGrid.ReadonlyCell>
					);
				},
				disableHiding: true,
			}),
			columnHelper.column({
				id: 'isSelected',
				header: () => (
					<div className='flex justify-center items-center w-full h-full'>
						Select
					</div>
				),
				cell: (context) => {
					const entity = context.row.original;
					if (isProductRow(entity)) {
						return (
							<div className='group/container relative size-full'>
								<div
									className='group/cell relative flex size-full items-center gap-x-2 px-4 py-2.5 outline-none bg-ui-bg-base cursor-not-allowed'
									tabIndex={-1}
								/>
							</div>
						);
					}
					const value = getValues('products').find(
						(product) => product.variantId === entity.id,
					);
					const index = value?.index;
					const _default =
						typeof index !== 'undefined'
							? getValues(`products.${index}.isSelected`)
							: false;
					const [isChecked, setIsChecked] = useState<boolean>(_default);
					const handleChangeSwitch = (e: boolean) => {
						if (typeof index !== 'undefined') {
							setValue(`products.${index}.isSelected`, e);
							setIsChecked(e);
						}
					};
					return (
						<div className='flex justify-center items-center h-full'>
							<Switch
								checked={isChecked}
								onCheckedChange={handleChangeSwitch}
							/>
						</div>
					);
				},
			}),
			columnHelper.column({
				id: 'title',
				header: 'Custom Title',
				cell: (context) => {
					const entity = context.row.original;
					if (isProductRow(entity)) {
						return (
							<div className='group/container relative size-full'>
								<div
									className='group/cell relative flex size-full items-center gap-x-2 px-4 py-2.5 outline-none bg-ui-bg-base cursor-not-allowed'
									tabIndex={-1}
								/>
							</div>
						);
					}
					const value = getValues('products').find(
						(product) => product.variantId === entity.id,
					);
					const index = value?.index;
					if (typeof index === 'undefined') {
						return null;
					}
					const { ref, ...titleField } = form.register(
						`products.${index}.title`,
					);
					const isDisabled =
						typeof index !== 'undefined'
							? !watch(`products.${index}.isSelected`)
							: true;
					return (
						<Controller
							{...titleField}
							render={({ field }) => {
								return (
									<div className='group/container relative size-full'>
										<div
											className={clx(
												'group/cell relative flex size-full items-center gap-x-2 px-4 py-2.5 outline-none',
												{
													'bg-ui-bg-base': isDisabled,
												},
											)}
											tabIndex={-1}
										>
											<div className='relative z-[1] flex size-full items-center justify-center'>
												<input
													{...field}
													ref={ref}
													type='text'
													className={clx(
														'txt-compact-small text-ui-fg-subtle flex size-full cursor-pointer items-center justify-center bg-transparent outline-none',
														'focus:cursor-text',
														'disabled:cursor-not-allowed',
													)}
													tabIndex={-1}
													disabled={
														typeof index !== 'undefined'
															? !watch(`products.${index}.isSelected`)
															: true
													}
												/>
											</div>
										</div>
									</div>
								);
							}}
						/>
					);
				},
			}),
			columnHelper.column({
				id: 'price',
				header: 'Custom Price',
				cell: (context) => {
					const entity = context.row.original;
					if (isProductRow(entity)) {
						return (
							<div className='group/container relative size-full'>
								<div
									className='group/cell relative flex size-full items-center gap-x-2 px-4 py-2.5 outline-none bg-ui-bg-base cursor-not-allowed'
									tabIndex={-1}
								/>
							</div>
						);
					}
					const value = getValues('products').find(
						(product) => product.variantId === entity.id,
					);
					const index = value?.index;
					if (typeof index === 'undefined') {
						return null;
					}
					const { ref, ...priceField } = form.register(
						`products.${index}.price`,
					);
					const isDisabled =
						typeof index !== 'undefined'
							? !watch(`products.${index}.isSelected`)
							: true;
					const isProductSuggestions = selectType === 'product_suggestions';
					return (
						<Controller
							{...priceField}
							render={({ field }) => {
								return (
									<div className='group/container relative size-full'>
										<div
											className={clx(
												'group/cell relative flex size-full items-center gap-x-2 px-4 py-2.5 outline-none',
												{
													'bg-ui-bg-base': isDisabled || isProductSuggestions,
												},
											)}
											tabIndex={-1}
										>
											<div className='relative z-[1] flex size-full items-center justify-center'>
												<div className='relative flex size-full items-center'>
													<input
														{...field}
														ref={ref}
														type='number'
														onChange={(e) =>
															field.onChange(Number(e.target.value))
														}
														inputMode='decimal'
														className={clx(
															'txt-compact-small text-ui-fg-subtle flex size-full cursor-pointer items-center justify-center bg-transparent outline-none',
															'focus:cursor-text',
															'disabled:cursor-not-allowed',
														)}
														tabIndex={-1}
														disabled={isDisabled || isProductSuggestions}
													/>
												</div>
											</div>
										</div>
									</div>
								);
							}}
						/>
					);
				},
			}),
		];
	}, [t, setValue, getValues, watch, form, selectType]);

	return colDefs;
};

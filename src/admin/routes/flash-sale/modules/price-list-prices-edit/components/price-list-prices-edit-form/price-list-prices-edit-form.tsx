import { zodResolver } from '@hookform/resolvers/zod';
import type { HttpTypes } from '@medusajs/types';
import { Button, toast } from '@medusajs/ui';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import { DataGrid } from '../../../../../../components/data-grid';
import {
	RouteFocusModal,
	useRouteModal,
} from '../../../../../../components/modals';
import { KeyboundForm } from '../../../../../../components/utilities/keybound-form';
import { castNumber } from '../../../../../../lib/cast-number';
import { usePriceListGridColumns } from '../../../../common/hooks/use-price-list-grid-columns';
import {
	type PriceListUpdateProductVariantsSchema,
	PriceListUpdateProductsSchema,
} from '../../../../common/schemas';
import { isProductRow } from '../../../../common/utils';
import type { PriceListCustom } from '@customTypes/price-list-custom';
import { getFlashSale } from '../../../../../../hooks/api/flash-sales';

interface AdminPriceListCustom extends HttpTypes.AdminPriceList {
	price_list_custom: PriceListCustom;
}

type PriceListPricesEditFormProps = {
	priceList: HttpTypes.AdminPriceList;
	products: HttpTypes.AdminProduct[];
	regions: HttpTypes.AdminRegion[];
	currencies: HttpTypes.AdminStoreCurrency[];
	pricePreferences: HttpTypes.AdminPricePreference[];
};

const PricingProductPricesSchema = z.object({
	products: PriceListUpdateProductsSchema,
});

export const PriceListPricesEditForm = ({
	priceList,
	products,
	regions,
	currencies,
	pricePreferences,
}: PriceListPricesEditFormProps) => {
	const { t } = useTranslation();
	const { handleSuccess, setCloseOnEscape } = useRouteModal();
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [initialValue, setInitialValue] =
		useState<PriceListUpdateProductsSchema>({});
	const [priceLists, setPriceLists] = useState<AdminPriceListCustom>();

	const form = useForm<z.infer<typeof PricingProductPricesSchema>>({
		resolver: zodResolver(
			PricingProductPricesSchema.superRefine((data, ctx) => {
				const variants = [];
				for (const [_productId, product] of Object.entries(
					data.products || {},
				)) {
					const { variants: _variants } = product || {};
					for (const [variantId, variant] of Object.entries(_variants || {})) {
						const { flash_sale: flashSale } = variant || {};
						if (
							(typeof flashSale?.quantity === 'string' ||
								typeof flashSale?.quantity === 'number') &&
							typeof flashSale.available_quantity === 'number'
						) {
							if (
								Number(flashSale.quantity) >
								Number(flashSale.available_quantity)
							) {
								variants.push({
									path: `products.${_productId}.variants.${variantId}.flash_sale.quantity`,
									quantity: Number(flashSale.quantity),
								});
							}
						}
					}
				}
				variants.map((variant) => {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						message: 'Cannot be specified more than available.',
						path: [variant.path],
					});
				});
			}),
		),
	});

	const { setValue } = form;

	const handleSubmit = form.handleSubmit(async (values) => {
		setIsLoading(true);
		const { products } = values;

		const { pricesToDelete, pricesToCreate, pricesToUpdate } = sortPrices(
			products,
			initialValue,
			regions,
		);

		fetch(`/admin/custom/flash-sales/${priceList.id}/products`, {
			credentials: 'include',
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				delete: pricesToDelete,
				update: pricesToUpdate,
				create: pricesToCreate,
				products,
			}),
		})
			.then((res) => res.json())
			.then(({ message }) => {
				setIsLoading(false);
				if (message) {
					toast.error(t('general.error'), {
						description: message,
					});
				} else {
					toast.success(t('priceLists.products.edit.successToast'));
					handleSuccess();
					setTimeout(() => {
						window.location.reload();
					}, 500);
				}
			})
			.catch((error) => {
				setIsLoading(false);
				console.error('Error:', error);
				toast.error(t('general.error'), {
					description: error.message,
				});
			});
	});

	useEffect(() => {
		const fetchData = async () => {
			if (priceList) {
				const { price_list } = await getFlashSale(priceList.id);
				if (price_list) {
					setPriceLists(price_list as unknown as AdminPriceListCustom);
				}
			}
		};
		fetchData();
	}, [priceList]);

	useEffect(() => {
		if (priceLists) {
			const initialValue = initRecord(priceLists, products);
			setInitialValue(initialValue);
			setValue('products', initialValue);
		}
	}, [priceLists, products, setValue]);

	const columns = usePriceListGridColumns({
		currencies,
		regions,
		pricePreferences,
	});

	return (
		<RouteFocusModal.Form form={form}>
			<KeyboundForm onSubmit={handleSubmit} className='flex size-full flex-col'>
				<RouteFocusModal.Header />
				<RouteFocusModal.Body className='flex flex-col overflow-hidden'>
					<DataGrid
						columns={columns}
						data={products}
						getSubRows={(row) => {
							if (isProductRow(row) && row.variants) {
								return row.variants;
							}
						}}
						state={form}
						onEditingChange={(editing) => setCloseOnEscape(!editing)}
					/>
				</RouteFocusModal.Body>
				<RouteFocusModal.Footer>
					<div className='flex items-center justify-end gap-x-2'>
						<RouteFocusModal.Close asChild>
							<Button size='small' variant='secondary'>
								{t('actions.cancel')}
							</Button>
						</RouteFocusModal.Close>
						<Button size='small' type='submit' isLoading={isLoading}>
							{t('actions.save')}
						</Button>
					</div>
				</RouteFocusModal.Footer>
			</KeyboundForm>
		</RouteFocusModal.Form>
	);
};

function initRecord(
	priceList: AdminPriceListCustom,
	products: HttpTypes.AdminProduct[],
): PriceListUpdateProductsSchema {
	const record: PriceListUpdateProductsSchema = {};

	const variantPrices = priceList.prices?.reduce((variants, price) => {
		const variantObject = variants[price.variant_id] || {};

		const isRegionPrice = !!price.rules?.region_id;

		if (isRegionPrice) {
			const regionId = price.rules.region_id as string;

			variantObject.region_prices = {
				...variantObject.region_prices,
				[regionId]: {
					amount: price.amount.toString(),
					id: price.id,
				},
			};
		} else {
			variantObject.currency_prices = {
				...variantObject.currency_prices,
				[price.currency_code]: {
					amount: price.amount.toString(),
					id: price.id,
				},
			};
		}

		variants[price.variant_id] = variantObject;
		return variants;
	}, {} as PriceListUpdateProductVariantsSchema);

	for (const product of products) {
		record[product.id] = {
			variants:
				product.variants?.reduce((variants, variant) => {
					const available_quantity = variant
						? (variant.inventory_items?.[0]?.inventory?.location_levels?.[0]
								?.available_quantity ?? 0)
						: 0;
					const price_list_variant =
						priceList?.price_list_custom?.price_list_variants?.filter(
							(price_list_variant) =>
								price_list_variant.product_variant_id === variant.id &&
								!price_list_variant.deleted_at,
						)[0];
					if (variantPrices[variant.id]) {
						variantPrices[variant.id].flash_sale = {
							quantity: price_list_variant?.quantity ?? 0,
							available_quantity: available_quantity,
						};
					}

					const prices = variantPrices[variant.id] || {};
					variants[variant.id] = prices;

					return variants;
				}, {} as PriceListUpdateProductVariantsSchema) || {},
		};
	}

	return record;
}

type PriceObject = {
	variantId: string;
	currencyCode: string;
	regionId?: string;
	amount: number;
	id?: string | null;
};

function convertToPriceArray(
	data: PriceListUpdateProductsSchema,
	regions: HttpTypes.AdminRegion[],
) {
	const prices: PriceObject[] = [];

	const regionCurrencyMap = regions.reduce(
		(map, region) => {
			map[region.id] = region.currency_code;
			return map;
		},
		{} as Record<string, string>,
	);

	for (const [_productId, product] of Object.entries(data || {})) {
		const { variants } = product || {};

		for (const [variantId, variant] of Object.entries(variants || {})) {
			const { currency_prices: currencyPrices, region_prices: regionPrices } =
				variant || {};

			for (const [currencyCode, currencyPrice] of Object.entries(
				currencyPrices || {},
			)) {
				if (
					currencyPrice?.amount !== '' &&
					typeof currencyPrice?.amount !== 'undefined'
				) {
					prices.push({
						variantId,
						currencyCode,
						amount: castNumber(currencyPrice.amount),
						id: currencyPrice.id,
					});
				}
			}

			for (const [regionId, regionPrice] of Object.entries(
				regionPrices || {},
			)) {
				if (
					regionPrice?.amount !== '' &&
					typeof regionPrice?.amount !== 'undefined'
				) {
					prices.push({
						variantId,
						regionId,
						currencyCode: regionCurrencyMap[regionId],
						amount: castNumber(regionPrice.amount),
						id: regionPrice.id,
					});
				}
			}
		}
	}

	return prices;
}

function createMapKey(obj: PriceObject) {
	return `${obj.variantId}-${obj.currencyCode}-${obj.regionId || 'none'}-${
		obj.id || 'none'
	}`;
}

function comparePrices(initialPrices: PriceObject[], newPrices: PriceObject[]) {
	const pricesToUpdate: HttpTypes.AdminUpdatePriceListPrice[] = [];
	const pricesToCreate: HttpTypes.AdminCreatePriceListPrice[] = [];
	const pricesToDelete: string[] = [];

	const initialPriceMap = initialPrices.reduce(
		(map, price) => {
			map[createMapKey(price)] = price;
			return map;
		},
		{} as Record<string, (typeof initialPrices)[0]>,
	);

	const newPriceMap = newPrices.reduce(
		(map, price) => {
			map[createMapKey(price)] = price;
			return map;
		},
		{} as Record<string, (typeof newPrices)[0]>,
	);

	const keys = new Set([
		...Object.keys(initialPriceMap),
		...Object.keys(newPriceMap),
	]);

	for (const key of keys) {
		const initialPrice = initialPriceMap[key];
		const newPrice = newPriceMap[key];

		if (initialPrice && newPrice) {
			if (Number.isNaN(newPrice.amount) && newPrice.id) {
				pricesToDelete.push(newPrice.id);
			}

			if (initialPrice.amount !== newPrice.amount && newPrice.id) {
				pricesToUpdate.push({
					id: newPrice.id,
					variant_id: newPrice.variantId,
					currency_code: newPrice.currencyCode,
					rules: newPrice.regionId
						? { region_id: newPrice.regionId }
						: undefined,
					amount: newPrice.amount,
				});
			}
		}

		if (!initialPrice && newPrice) {
			pricesToCreate.push({
				variant_id: newPrice.variantId,
				currency_code: newPrice.currencyCode,
				rules: newPrice.regionId ? { region_id: newPrice.regionId } : undefined,
				amount: newPrice.amount,
			});
		}

		if (initialPrice && !newPrice && initialPrice.id) {
			pricesToDelete.push(initialPrice.id);
		}
	}

	return { pricesToDelete, pricesToCreate, pricesToUpdate };
}

function sortPrices(
	data: PriceListUpdateProductsSchema,
	initialValue: PriceListUpdateProductsSchema,
	regions: HttpTypes.AdminRegion[],
) {
	const initialPrices = convertToPriceArray(initialValue, regions);
	const newPrices = convertToPriceArray(data, regions);

	return comparePrices(initialPrices, newPrices);
}

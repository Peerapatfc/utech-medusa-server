import { zodResolver } from '@hookform/resolvers/zod';
import { Button, type ProgressStatus, ProgressTabs, toast } from '@medusajs/ui';
import { type FieldPath, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import type {
	HttpTypes,
	PriceListStatus,
	PriceListType,
} from '@medusajs/types';
import { useEffect, useState } from 'react';
import { z } from 'zod';
import {
	RouteFocusModal,
	useRouteModal,
} from '../../../../../../components/modals';
import { KeyboundForm } from '../../../../../../components/utilities/keybound-form';
import { exctractPricesFromProducts } from '../../../../common/utils';
import { PriceListDetailsForm } from './price-list-details-form';
import { PriceListPricesForm } from './price-list-prices-form';
import { PriceListProductsForm } from './price-list-products-form';
import {
	PricingCreateSchema,
	type PricingCreateSchemaType,
	PricingDetailsFields,
	PricingDetailsSchema,
	PricingPricesFields,
	PricingProductsFields,
	PricingProductsSchema,
} from './schema';
import { queryClient } from '../../../../../../lib/query-client';
import { flashSalesQueryKeys } from '../../../../../../hooks/api/flash-sales';
import { customerGroupsQueryKeys } from '../../../../../../hooks/api/customer-groups';

enum Tab {
	DETAIL = 'detail',
	PRODUCT = 'product',
	PRICE = 'price',
}

const tabOrder = [Tab.DETAIL, Tab.PRODUCT, Tab.PRICE] as const;

type TabState = Record<Tab, ProgressStatus>;

const initialTabState: TabState = {
	[Tab.DETAIL]: 'in-progress',
	[Tab.PRODUCT]: 'not-started',
	[Tab.PRICE]: 'not-started',
};

type PriceListCreateFormProps = {
	regions: HttpTypes.AdminRegion[];
	currencies: HttpTypes.AdminStoreCurrency[];
	pricePreferences: HttpTypes.AdminPricePreference[];
};

export const PriceListCreateForm = ({
	regions,
	currencies,
	pricePreferences,
}: PriceListCreateFormProps) => {
	const [tab, setTab] = useState<Tab>(Tab.DETAIL);
	const [tabState, setTabState] = useState<TabState>(initialTabState);
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const { t } = useTranslation();
	const { handleSuccess } = useRouteModal();

	const form = useForm<PricingCreateSchemaType>({
		defaultValues: {
			type: 'sale',
			status: 'active',
			title: '',
			description: '',
			product_ids: [],
			products: {},
			rules: {
				customer_group_id: [],
			},
		},
		resolver: zodResolver(
			PricingCreateSchema.refine(
				(data) =>
					data.starts_at && data.ends_at && data.ends_at >= data.starts_at,
				{
					message: 'Expiry date must be after the start date!',
					path: ['ends_at'],
				},
			).superRefine((data, ctx) => {
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
						message: 'Cannot be specify more than available quantity.',
						path: [variant.path],
					});
				});
			}),
		),
	});
	const {
		formState: { errors },
	} = form;

	const handleSubmit = form.handleSubmit(async (data) => {
		setIsLoading(true);

		const { rules, products } = data;

		const rulesPayload = rules?.customer_group_id?.length
			? { 'customer.groups.id': rules.customer_group_id.map((cg) => cg.id) }
			: undefined;

		const prices = exctractPricesFromProducts(products, regions);

		fetch('/admin/custom/flash-sales', {
			credentials: 'include',
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				title: data.title,
				type: data.type as PriceListType,
				status: data.status as PriceListStatus,
				description: data.description,
				starts_at: data.starts_at ? data.starts_at.toISOString() : null,
				ends_at: data.ends_at ? data.ends_at.toISOString() : null,
				rules: rulesPayload,
				prices,
				products,
			}),
		})
			.then((res) => res.json())
			.then(({ flash_sale, message }) => {
				setIsLoading(false);
				if (message) {
					toast.error(t('general.error'), {
						description: message,
					});
					handleChangeTab(Tab.DETAIL);
				} else {
					queryClient.invalidateQueries({
						queryKey: flashSalesQueryKeys.lists(),
					});
					queryClient.invalidateQueries({
						queryKey: customerGroupsQueryKeys.all,
					});

					toast.success(
						t('priceLists.create.successToast', {
							title: flash_sale.title,
						}),
					);
					handleSuccess(`../${flash_sale.id}`);
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

	const partialFormValidation = (
		fields: FieldPath<PricingCreateSchemaType>[],
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		schema: z.ZodSchema<any>,
	) => {
		form.clearErrors(fields);

		const values = fields.reduce(
			(acc, key) => {
				acc[key] = form.getValues(key);
				return acc;
			},
			{} as Record<string, unknown>,
		);

		const validationResult = schema.safeParse(values);

		if (!validationResult.success) {
			validationResult.error.errors.map(({ path, message, code }) => {
				form.setError(path.join('.') as keyof PricingCreateSchemaType, {
					type: code,
					message,
				});
			});

			return false;
		}

		return true;
	};

	const isTabDirty = (tab: Tab) => {
		switch (tab) {
			case Tab.DETAIL: {
				const fields = PricingDetailsFields;

				return fields.some((field) => {
					return form.getFieldState(field).isDirty;
				});
			}
			case Tab.PRODUCT: {
				const fields = PricingProductsFields;

				return fields.some((field) => {
					return form.getFieldState(field).isDirty;
				});
			}
			case Tab.PRICE: {
				const fields = PricingPricesFields;

				return fields.some((field) => {
					return form.getFieldState(field).isDirty;
				});
			}
		}
	};

	const handleChangeTab = (update: Tab) => {
		if (tab === update) {
			return;
		}

		if (tabOrder.indexOf(update) < tabOrder.indexOf(tab)) {
			const isCurrentTabDirty = isTabDirty(tab);

			setTabState((prev) => ({
				...prev,
				[tab]: isCurrentTabDirty ? prev[tab] : 'not-started',
				[update]: 'in-progress',
			}));

			setTab(update);
			return;
		}

		// get the tabs from the current tab to the update tab including the current tab
		const tabs = tabOrder.slice(0, tabOrder.indexOf(update));

		// validate all the tabs from the current tab to the update tab if it fails on any of tabs then set that tab as current tab
		for (const tab of tabs) {
			if (tab === Tab.DETAIL) {
				if (
					!partialFormValidation(PricingDetailsFields, PricingDetailsSchema)
				) {
					setTabState((prev) => ({
						...prev,
						[tab]: 'in-progress',
					}));
					setTab(tab);
					return;
				}

				setTabState((prev) => ({
					...prev,
					[tab]: 'completed',
				}));
			} else if (tab === Tab.PRODUCT) {
				if (
					!partialFormValidation(PricingProductsFields, PricingProductsSchema)
				) {
					setTabState((prev) => ({
						...prev,
						[tab]: 'in-progress',
					}));
					setTab(tab);

					return;
				}

				setTabState((prev) => ({
					...prev,
					[tab]: 'completed',
				}));
			}
		}

		setTabState((prev) => ({
			...prev,
			[tab]: 'completed',
			[update]: 'in-progress',
		}));
		setTab(update);
	};

	const handleNextTab = (tab: Tab) => {
		if (tabOrder.indexOf(tab) + 1 >= tabOrder.length) {
			return;
		}

		const nextTab = tabOrder[tabOrder.indexOf(tab) + 1];
		handleChangeTab(nextTab);
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (errors.ends_at) {
			handleChangeTab(Tab.DETAIL);
		}
	}, [errors]);

	return (
		<RouteFocusModal.Form form={form}>
			<ProgressTabs
				value={tab}
				onValueChange={(tab) => handleChangeTab(tab as Tab)}
				className='flex h-full flex-col overflow-hidden'
			>
				<KeyboundForm onSubmit={handleSubmit} className='flex h-full flex-col'>
					<RouteFocusModal.Header>
						<div className='flex w-full items-center justify-between gap-x-4'>
							<div className='-my-2 w-full max-w-[600px] border-l'>
								<ProgressTabs.List className='grid w-full grid-cols-3'>
									<ProgressTabs.Trigger
										status={tabState.detail}
										value={Tab.DETAIL}
									>
										{t('priceLists.create.tabs.details')}
									</ProgressTabs.Trigger>
									<ProgressTabs.Trigger
										status={tabState.product}
										value={Tab.PRODUCT}
									>
										{t('priceLists.create.tabs.products')}
									</ProgressTabs.Trigger>
									<ProgressTabs.Trigger
										status={tabState.price}
										value={Tab.PRICE}
									>
										{t('priceLists.create.tabs.prices')}
									</ProgressTabs.Trigger>
								</ProgressTabs.List>
							</div>
						</div>
					</RouteFocusModal.Header>
					<RouteFocusModal.Body className='size-full overflow-hidden'>
						<ProgressTabs.Content
							className='size-full overflow-y-auto'
							value={Tab.DETAIL}
						>
							<PriceListDetailsForm form={form} />
						</ProgressTabs.Content>
						<ProgressTabs.Content
							className='size-full overflow-y-auto'
							value={Tab.PRODUCT}
						>
							<PriceListProductsForm form={form} />
						</ProgressTabs.Content>
						<ProgressTabs.Content
							className='size-full overflow-hidden'
							value={Tab.PRICE}
						>
							<PriceListPricesForm
								form={form}
								regions={regions}
								currencies={currencies}
								pricePreferences={pricePreferences}
							/>
						</ProgressTabs.Content>
					</RouteFocusModal.Body>
					<RouteFocusModal.Footer>
						<div className='flex items-center justify-end gap-x-2'>
							<RouteFocusModal.Close asChild>
								<Button variant='secondary' size='small'>
									{t('actions.cancel')}
								</Button>
							</RouteFocusModal.Close>
							<PrimaryButton
								tab={tab}
								next={handleNextTab}
								isLoading={isLoading}
							/>
						</div>
					</RouteFocusModal.Footer>
				</KeyboundForm>
			</ProgressTabs>
		</RouteFocusModal.Form>
	);
};

type PrimaryButtonProps = {
	tab: Tab;
	next: (tab: Tab) => void;
	isLoading?: boolean;
};

const PrimaryButton = ({ tab, next, isLoading }: PrimaryButtonProps) => {
	const { t } = useTranslation();

	if (tab === Tab.PRICE) {
		return (
			<Button
				key='submit-button'
				type='submit'
				variant='primary'
				size='small'
				isLoading={isLoading}
			>
				{t('actions.save')}
			</Button>
		);
	}

	return (
		<Button
			key='next-button'
			type='button'
			variant='primary'
			size='small'
			onClick={() => next(tab)}
		>
			{t('actions.continue')}
		</Button>
	);
};

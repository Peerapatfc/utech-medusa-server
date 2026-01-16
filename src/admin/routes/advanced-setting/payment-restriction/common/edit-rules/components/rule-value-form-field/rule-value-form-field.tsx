import type { RuleAttributeOptionsResponse, StoreDTO } from '@medusajs/types';
import { CurrencyInput, Input, Select } from '@medusajs/ui';
import { useEffect, useState } from 'react';
import { type RefCallBack, useWatch } from 'react-hook-form';
import { useDebouncedSearch } from '../../../../../../../../admin/hooks/use-debounced-search';
import { currencies } from '../../../../../../../../admin/lib/data/currencies';
import { Form } from '../../../../../../../components/common/form';
import { Combobox } from '../../../../../../../components/inputs/combobox';
import { usePromotionRuleValues } from '../../../../../../../hooks/api/promotions';
import { useStore } from '../../../../../../../hooks/api/store';

type ProductVariant = {
	id: string;
	title: string;
	product: {
		title: string;
	};
};

type VariantOption = {
	label: string;
	value: string;
};

type RuleValueFormFieldType = {
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	form: any;
	identifier: string;
	scope:
		| 'application_method.buy_rules'
		| 'rules'
		| 'application_method.target_rules';
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	valuesField: any;
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	operatorsField: any;
	valuesRef: RefCallBack;
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	fieldRule: any;
	attributes: RuleAttributeOptionsResponse[];
	ruleType: 'rules' | 'target-rules' | 'buy-rules';
	isView?: boolean;
};

const buildFilters = (attribute?: string, store?: StoreDTO) => {
	if (!attribute || !store) {
		return {};
	}

	if (attribute === 'currency_code') {
		return {
			value: store.supported_currencies?.map((c) => c.currency_code),
		};
	}

	return {};
};

export const RuleValueFormField = ({
	form,
	identifier,
	scope,
	valuesField,
	operatorsField,
	valuesRef,
	fieldRule,
	attributes,
	ruleType,
	isView,
}: RuleValueFormFieldType) => {
	const attribute = attributes?.find(
		// @ts-ignore
		(attr) => attr.value === fieldRule.attribute,
	);
	// @ts-ignore
	const isPickupOption = attribute?.id === 'cart.pickup_option';
	// @ts-ignore
	const isProductVariant = attribute?.id === 'product.variant.id';

	const { store, isLoading: isStoreLoading } = useStore();
	const [productVariants, setProductVariants] = useState<VariantOption[]>([]);
	const [searchQuery, setSearchQuery] = useState<string>('');
	const debouncedSearch = useDebouncedSearch();

	useEffect(() => {
		const fetchProductVariants = async () => {
			if (isProductVariant && debouncedSearch) {
				try {
					const queryParams = new URLSearchParams();
					if (searchQuery) {
						queryParams.append('q', searchQuery);
					}
					queryParams.append('limit', '10');

					const response = await fetch(
						`/admin/product-variants?${queryParams.toString()}`,
						{
							credentials: 'include',
						},
					);
					const data = await response.json();
					const variants = data.variants.map((variant: ProductVariant) => ({
						label: `${variant.product.title} - ${variant.title}`,
						value: variant.id,
					}));
					setProductVariants(variants);
				} catch (error) {
					console.error('Error fetching product variants:', error);
				}
			}
		};

		fetchProductVariants();
	}, [isProductVariant, debouncedSearch, searchQuery]);

	const { values: options = [] } = usePromotionRuleValues(
		ruleType,
		// @ts-ignore
		// biome-ignore lint/style/noNonNullAssertion: <explanation>
		attribute?.id!,
		// @ts-ignore
		buildFilters(attribute?.id, store),
		{
			enabled:
				!!attribute?.id &&
				// @ts-ignore
				['select', 'multiselect'].includes(attribute.field_type) &&
				!isStoreLoading &&
				!isPickupOption &&
				!isProductVariant,
		},
	);

	const pickupOptions = [
		{
			label: 'Home Delivery',
			value: 'home-delivery',
		},
		{
			label: 'In-Store Pickup',
			value: 'in-store-pickup',
		},
	];

	if (isPickupOption) {
		options.push(...pickupOptions);
	}

	if (isProductVariant) {
		options.push(...productVariants);
	}

	const watchOperator = useWatch({
		control: form.control,
		name: operatorsField.name,
	});
	const currency = currencies.THB;

	const handleShippingRateChange = (value: string | undefined) => {
		form.setValue(valuesField.name, value ? Number(value) : null);
	};

	const handleSearch = (query: string) => {
		setSearchQuery(query);
	};

	return (
		<Form.Field
			key={`${identifier}.${scope}.${valuesField.name}-${fieldRule.attribute}`}
			{...valuesField}
			render={({ field: { onChange, value, ref, ...field } }) => {
				// @ts-ignore
				if (attribute?.field_type === 'number') {
					return (
						<Form.Item className='basis-1/2'>
							<Form.Control>
								<CurrencyInput
									{...field}
									min={0}
									ref={valuesRef}
									onValueChange={handleShippingRateChange}
									code={currency.code}
									className='bg-ui-bg-base'
									symbol={currency.symbol_native}
									value={value === null ? '' : value}
									disabled={!fieldRule.attribute || isView}
								/>
							</Form.Control>
							<Form.ErrorMessage />
						</Form.Item>
					);
				}
				// @ts-ignore
				if (attribute?.field_type === 'text') {
					return (
						<Form.Item className='basis-1/2'>
							<Form.Control>
								<Input
									{...field}
									onChange={onChange}
									className='bg-ui-bg-base'
									disabled={!fieldRule.attribute || isView}
								/>
							</Form.Control>
							<Form.ErrorMessage />
						</Form.Item>
					);
				}
				if (watchOperator === 'eq') {
					return (
						<Form.Item className='basis-1/2'>
							<Form.Control>
								<Select
									{...field}
									value={Array.isArray(value) ? value[0] : value}
									onValueChange={onChange}
									disabled={!fieldRule.attribute || isView}
								>
									<Select.Trigger ref={ref} className='bg-ui-bg-base'>
										<Select.Value placeholder='Select Value' />
									</Select.Trigger>

									<Select.Content>
										{options?.map((option, i) => (
											<Select.Item
												// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
												key={`${identifier}-value-option-${i}`}
												value={option.value}
											>
												<span className='text-ui-fg-subtle'>
													{option.label}
												</span>
											</Select.Item>
										))}
									</Select.Content>
								</Select>
							</Form.Control>
							<Form.ErrorMessage />
						</Form.Item>
					);
				}
				return (
					<Form.Item className='basis-1/2'>
						<Form.Control>
							<Combobox
								{...field}
								placeholder='Select Values'
								options={options}
								value={Array.isArray(value) ? value : [value]}
								onChange={onChange}
								onSearchValueChange={
									isProductVariant ? handleSearch : undefined
								}
								searchValue={isProductVariant ? searchQuery : undefined}
								className='bg-ui-bg-base'
								disabled={!fieldRule.attribute || isView}
							/>
						</Form.Control>

						<Form.ErrorMessage />
					</Form.Item>
				);
			}}
		/>
	);
};

import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Heading, Input, Select, toast } from '@medusajs/ui';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import type { ProductAttribute } from '../../../../../types/attribute';
import { Form } from '../../../../components/common/form';
import { Combobox } from '../../../../components/inputs/combobox';
import { RouteDrawer } from '../../../../components/route-modal';
import { useProductAttributeCategories } from '../../../../hooks/api/product-attribute-categories';
import { useUpdateProduct } from '../../../../hooks/api/products';
import { useDebounce } from './hooks/use-debounce';
import {
	applyAttributeFilters,
	fetchAttributes,
	fetchMultipleCategoryAttributes,
} from './utils/attributes';
import { validateMultipleMetadataFields } from './utils/metadata-checker';
import {
	buildValidationConfigs,
	getChangedFieldsAndIsUnique,
	processMetadataUpdate,
} from './utils/submit-form';

const CustomAttributeSchema = z.object({
	attributes: z.array(
		z.object({
			id: z.string().optional(),
			code: z.string().optional(),
			title: z.string().optional(),
			value: z.string().optional().or(z.array(z.string())),
			isNew: z.boolean().optional(),
		}),
	),
});

type CustomAttributeFormValues = z.infer<typeof CustomAttributeSchema>;

const EditCustomAttributesForm = () => {
	const navigate = useNavigate();
	const { id } = useParams();
	const { t } = useTranslation();
	const [attributes, setAttributes] = useState<ProductAttribute[]>([]);
	const [existingMetadata, setExistingMetadata] = useState<
		Record<string, unknown>
	>({});
	const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
	const [allAttributes, setAllAttributes] = useState<ProductAttribute[]>([]);
	const [categoryAttributes, setCategoryAttributes] = useState<
		ProductAttribute[]
	>([]);
	const [isLoadingCategoryAttributes, setIsLoadingCategoryAttributes] =
		useState<boolean>(false);
	const [searchValue, setSearchValue] = useState<string>('');

	// Use debounced search value for API calls
	const debouncedSearchValue = useDebounce(searchValue);

	const { categories, isLoading: isCategoriesLoading } =
		useProductAttributeCategories(
			debouncedSearchValue.trim()
				? { q: debouncedSearchValue.trim() }
				: undefined,
		);
	const { mutateAsync } = useUpdateProduct(id ?? '');

	const methods = useForm<CustomAttributeFormValues>({
		defaultValues: {
			attributes: [],
		},
		resolver: zodResolver(CustomAttributeSchema),
	});

	const { fields, replace } = useFieldArray({
		control: methods.control,
		name: 'attributes',
	});

	const queryClient = useQueryClient();
	const revalidateProductMetadata = () => {
		queryClient.invalidateQueries({
			queryKey: ['product-with-metadata', { id }],
		});
	};

	const fetchAttributesCallback = useCallback(async () => {
		const {
			metadata,
			selectedCategories: categories,
			allAttributes: attributes,
		} = await fetchAttributes(id ?? '');
		setExistingMetadata(metadata);
		setSelectedCategories(categories);
		setAllAttributes(attributes);
	}, [id]);

	const fetchMultipleCategoryAttributesCallback = useCallback(
		async (categoryIds: string[]) => {
			setIsLoadingCategoryAttributes(true);
			try {
				const attributes = await fetchMultipleCategoryAttributes(categoryIds);
				setCategoryAttributes(attributes);
				return attributes;
			} finally {
				setIsLoadingCategoryAttributes(false);
			}
		},
		[],
	);

	const applyAttributeFiltersCallback = useCallback(
		(attributeList: ProductAttribute[], metadata: Record<string, unknown>) => {
			const { filteredAttributes, formValues } = applyAttributeFilters(
				attributeList,
				metadata,
				selectedCategories,
				categoryAttributes,
				allAttributes,
			);

			setAttributes(filteredAttributes);
			replace(formValues);
		},
		[replace, selectedCategories, categoryAttributes, allAttributes],
	);

	useEffect(() => {
		fetchMultipleCategoryAttributesCallback(selectedCategories);
	}, [selectedCategories, fetchMultipleCategoryAttributesCallback]);

	useEffect(() => {
		if (allAttributes.length > 0) {
			const attributesInMetadata = allAttributes.filter(
				(attr: ProductAttribute) => attr.code && attr.code in existingMetadata,
			);

			applyAttributeFiltersCallback(attributesInMetadata, existingMetadata);
		}
	}, [allAttributes, existingMetadata, applyAttributeFiltersCallback]);

	useEffect(() => {
		fetchAttributesCallback();
	}, [fetchAttributesCallback]);

	const onSubmit = methods.handleSubmit(async (values) => {
		try {
			// Process metadata update

			const updatedMetadata = processMetadataUpdate(
				existingMetadata,
				values,
				attributes,
				allAttributes,
				selectedCategories,
			);

			// Track changed fields
			const changedFields = getChangedFieldsAndIsUnique(
				values,
				existingMetadata,
				allAttributes,
			);

			// Build validation configs for changed fields only
			const validation_configs = buildValidationConfigs(
				updatedMetadata,
				changedFields,
			);

			if (validation_configs.length > 0) {
				const validation = await validateMultipleMetadataFields(
					id ?? '',
					validation_configs,
				);

				if (!validation.is_valid) {
					for (const [_, error_message] of Object.entries(
						validation.field_errors,
					)) {
						toast.error(error_message);
					}
					return;
				}
			}

			await mutateAsync(
				{ metadata: updatedMetadata },
				{
					onSuccess: ({ product }) => {
						methods.reset({
							// biome-ignore lint/suspicious/noExplicitAny: Required for form reset compatibility
							attributes: product.metadata as any,
						});
						setSelectedCategories([]);
						setCategoryAttributes([]);
					},
					onError(error) {
						throw new Error(
							`Failed to update product metadata: ${error.message}`,
						);
					},
				},
			);

			revalidateProductMetadata();

			toast.success('The changes made has been saved');
			navigate(`/products/${id}`);
		} catch (error) {
			toast.error("The changes hasn't been saved");
		}
	});

	return (
		<RouteDrawer>
			<RouteDrawer.Header>
				<RouteDrawer.Title asChild>
					<Heading>Edit Custom Attributes</Heading>
				</RouteDrawer.Title>
			</RouteDrawer.Header>
			<FormProvider {...methods}>
				<form
					onSubmit={onSubmit}
					className='flex flex-1 flex-col overflow-hidden'
				>
					<RouteDrawer.Body className='flex flex-1 flex-col gap-y-4 overflow-auto divide-y'>
						<div className='space-y-2'>
							<Form.Label className='flex items-center gap-2'>
								Select Product Attribute Categories
							</Form.Label>
							<div className='max-w-full'>
								<Combobox
									value={selectedCategories}
									onChange={(values) => {
										setSelectedCategories(values || []);
									}}
									searchValue={searchValue}
									onSearchValueChange={(value) => {
										setSearchValue(value);
									}}
									options={
										categories?.map((category) => ({
											value: category.id,
											label: category.name,
										})) || []
									}
									placeholder='Select product attribute categories'
								/>
								{(isLoadingCategoryAttributes || isCategoriesLoading) && (
									<div className='text-ui-fg-subtle mt-2'>
										{isCategoriesLoading
											? 'Searching categories...'
											: 'Loading attributes...'}
									</div>
								)}
							</div>
						</div>
						<div className='pt-4 flex flex-col gap-y-4'>
							{fields.map((field, index) => (
								<Form.Field
									key={field.id}
									control={methods.control}
									name={`attributes.${index}.value`}
									render={({ field }) => (
										<Form.Item>
											<Form.Label className='flex items-center gap-2'>
												{attributes[index]?.title}
												{attributes[index]?.is_default && (
													<span className='bg-emerald-100 text-emerald-700 text-xs font-medium px-2 py-0.5 rounded-full'>
														Default
													</span>
												)}
											</Form.Label>
											<Form.Control>
												{attributes[index]?.type === 'text' ? (
													<Input {...field} />
												) : attributes[index]?.type === 'select' ||
													attributes[index]?.type === 'swatch_visual' ? (
													<Select
														{...field}
														value={
															Array.isArray(field.value)
																? field.value[0] || 'none'
																: field.value || 'none'
														}
														onValueChange={(newValue) =>
															field.onChange(newValue)
														}
													>
														<Select.Trigger>
															<Select.Value placeholder='Select an option' />
														</Select.Trigger>
														<Select.Content>
															<Select.Item value='none'>
																<span>No selection</span>
															</Select.Item>
															{attributes[index]?.options?.map((option) => (
																<Select.Item
																	key={option.value}
																	value={option.value}
																>
																	{option.title}
																</Select.Item>
															))}
														</Select.Content>
													</Select>
												) : attributes[index]?.type === 'multiselect' ? (
													<Combobox
														value={
															Array.isArray(field.value) &&
															field.value.length > 0
																? field.value
																: []
														}
														onChange={(newValue) => field.onChange(newValue)}
														options={
															attributes[index]?.options?.map((option) => ({
																value: option.value,
																label: option.title,
															})) || []
														}
														placeholder='Select options'
													/>
												) : null}
											</Form.Control>
											<Form.ErrorMessage />
										</Form.Item>
									)}
								/>
							))}

							{fields.length === 0 && !isLoadingCategoryAttributes && (
								<div className='text-ui-fg-subtle text-center py-4'>
									{selectedCategories.length > 0
										? 'No attributes available for the selected categories.'
										: 'No attributes available. Select categories to see attributes, default attributes will always be shown.'}
								</div>
							)}
						</div>
					</RouteDrawer.Body>
					<RouteDrawer.Footer>
						<div className='flex items-center justify-end gap-x-2'>
							<RouteDrawer.Close asChild>
								<Button variant='secondary' size='small'>
									{t('actions.cancel')}
								</Button>
							</RouteDrawer.Close>
							<Button type='submit' size='small'>
								{t('actions.save')}
							</Button>
						</div>
					</RouteDrawer.Footer>
				</form>
			</FormProvider>
		</RouteDrawer>
	);
};

export default EditCustomAttributesForm;

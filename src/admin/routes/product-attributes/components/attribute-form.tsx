import { zodResolver } from '@hookform/resolvers/zod';
import { PencilSquare } from '@medusajs/icons';
import { Button, Input, Select, Switch, Textarea, toast } from '@medusajs/ui';
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import type {
	ProductAttribute,
	ProductEditAttribute,
} from '../../../../types/attribute';
import { Form } from '../../../components/common/form';
import { Combobox } from '../../../components/inputs/combobox/combobox';
import { useProductAttributeCategories } from '../../../hooks/api/product-attribute-categories';

// Extend ProductAttribute with category_ids
interface ExtendedProductAttribute extends ProductAttribute {
	category_ids?: string[];
	is_default?: boolean;
}

const AttributeSchema = z.object({
	title: z.string().min(1),
	code: z
		.string()
		.min(1)
		.regex(/^[a-z0-9_]+$/, {
			message:
				'Code must contain only lowercase letters, numbers, and underscores',
		}),
	description: z.string().optional(),
	type: z.enum([
		'text',
		'multiselect',
		'select',
		'swatch_visual',
		'swatch_text',
	]),
	is_filterable: z.boolean(),
	is_required: z.boolean(),
	is_unique: z.boolean(),
	status: z.boolean(),
	rank: z.number().min(0),
	metadata: z.object({
		description_en: z.string().optional(),
	}),
	use_in_product_variant: z.boolean(),
	category_id: z.string().optional(),
	category_ids: z.array(z.string()).optional(),
	is_default: z.boolean().optional(),
});

const attributeTypes = [
	{ value: 'text', label: 'Text' },
	{ value: 'multiselect', label: 'Multi select' },
	{ value: 'select', label: 'Select' },
	{ value: 'swatch_visual', label: 'Visual Swatch' },
	{ value: 'swatch_text', label: 'Text Swatch' },
];

interface AttributeFormProps {
	initialData?: ProductEditAttribute;
	onSubmit: (data: ExtendedProductAttribute) => Promise<void>;
	isEditMode: boolean;
	setIsCreateModalOpen?: (isCreateModalOpen: boolean) => void;
	setLoading?: (loading: boolean) => void;
}

export const AttributeForm = ({
	initialData,
	onSubmit,
	isEditMode,
	setIsCreateModalOpen,
	setLoading,
}: AttributeFormProps) => {
	const { t } = useTranslation();
	const [isCodeEditable, setIsCodeEditable] = useState(false);
	const navigate = useNavigate();
	const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
	const [initialCategories, setInitialCategories] = useState<string[]>([]);
	const [isLoadingCategories, setIsLoadingCategories] = useState(false);

	// Fetch categories
	const { categories, isLoading: isCategoriesLoading } =
		useProductAttributeCategories();

	// Create options for Combobox
	const categoryOptions =
		categories?.map((category) => ({
			value: category.id || '',
			label: category.name || '',
			disabled: false,
		})) || [];

	// Load attribute's assigned categories when in edit mode
	useEffect(() => {
		const checkAttributeInCategories = async () => {
			if (isEditMode && initialData?.attributes[0]?.id && categories) {
				setIsLoadingCategories(true);
				const attributeId = initialData.attributes[0].id;
				const assignedCategoryIds: string[] = [];

				// For each category, fetch attributes and check if our attribute is assigned
				for (const category of categories) {
					if (!category.id) continue;

					try {
						// Use the hook in a way that doesn't cause React hooks rules violations
						const response = await fetch(
							`/admin/product-attribute-categories/${category.id}/attributes`,
							{
								credentials: 'include',
							},
						);

						if (response.ok) {
							const data = await response.json();
							const attributes = data.attributes || [];

							// Check if our attribute is in this category
							if (
								attributes.some(
									(attr: ProductAttribute) => attr.id === attributeId,
								)
							) {
								assignedCategoryIds.push(category.id);
							}
						}
					} catch (error) {
						console.error(
							`Error checking attribute in category ${category.id}:`,
							error,
						);
					}
				}

				setSelectedCategories(assignedCategoryIds);
				setInitialCategories(assignedCategoryIds);
				setIsLoadingCategories(false);
			}
		};

		checkAttributeInCategories();
	}, [isEditMode, initialData, categories]);

	const defaultValues = {
		title: initialData?.attributes[0]?.title || '',
		code: initialData?.attributes[0]?.code || '',
		description: initialData?.attributes[0]?.description || '',
		type: initialData?.attributes[0]?.type || 'text',
		is_filterable: initialData?.attributes[0]?.is_filterable || false,
		is_required: initialData?.attributes[0]?.is_required || false,
		is_unique: initialData?.attributes[0]?.is_unique || false,
		status: initialData?.attributes[0]?.status ?? true,
		rank: initialData?.attributes[0]?.rank || 0,
		metadata: {
			description_en:
				initialData?.attributes[0]?.metadata?.description_en || '',
		},
		use_in_product_variant:
			initialData?.attributes[0]?.use_in_product_variant || false,
		category_id: initialData?.attributes[0]?.category_id || '',
		category_ids: [],
		is_default: initialData?.attributes[0]?.is_default || false,
	};

	const methods = useForm<ExtendedProductAttribute>({
		defaultValues,
		resolver: zodResolver(AttributeSchema),
	});

	useEffect(() => {
		if (!isEditMode) {
			const subscription = methods.watch((value, { name }) => {
				if (name === 'title' && !isCodeEditable) {
					const code = value.title
						?.toLowerCase()
						.replace(/[^a-z0-9_\s]/g, '')
						.replace(/[^a-zA-Z0-9]+/g, '_');
					methods.setValue('code', code ?? '');
				}
			});
			return () => subscription.unsubscribe();
		}
	}, [methods, isCodeEditable, isEditMode]);

	// Function to update attribute-category assignments
	const updateAttributeCategories = async (attributeId: string) => {
		if (!attributeId) return;

		try {
			// Find categories to add (not in initialCategories)
			const categoriesToAdd = selectedCategories.filter(
				(categoryId) => !initialCategories.includes(categoryId),
			);

			// Find categories to remove (in initialCategories but not in selectedCategories)
			const categoriesToRemove = initialCategories.filter(
				(categoryId) => !selectedCategories.includes(categoryId),
			);

			// Process category additions
			for (const categoryId of categoriesToAdd) {
				await fetch(
					`/admin/product-attribute-categories/${categoryId}/attributes`,
					{
						method: 'POST',
						credentials: 'include',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({
							attribute_ids: [attributeId],
						}),
					},
				);
			}

			// Process category removals
			for (const categoryId of categoriesToRemove) {
				await fetch(
					`/admin/product-attribute-categories/${categoryId}/attributes`,
					{
						method: 'DELETE',
						credentials: 'include',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({
							attribute_ids: [attributeId],
						}),
					},
				);
			}
		} catch (error) {
			console.error('Error updating attribute categories:', error);
			throw new Error('Failed to update attribute categories');
		}
	};

	const handleSubmit = methods.handleSubmit(async (data) => {
		if (!isEditMode && setLoading) {
			setLoading(true);
		}

		// Pass the selected categories array through
		data.category_ids = selectedCategories;

		try {
			await onSubmit(data);

			// For edit mode, update the attribute-category assignments
			if (isEditMode && initialData?.attributes[0]?.id) {
				await updateAttributeCategories(initialData.attributes[0].id);
			}

			toast.success(
				isEditMode
					? 'Attribute updated successfully'
					: 'Attribute created successfully',
			);
			if (!isEditMode) {
				if (setIsCreateModalOpen) {
					setIsCreateModalOpen(false);
				}
				if (setLoading) {
					setLoading(true);
				}
			}
			navigate('/product-attributes');
		} catch (error) {
			console.error(
				`Error ${isEditMode ? 'updating' : 'creating'} attribute:`,
				error,
			);
			toast.error(
				`An error occurred while ${
					isEditMode ? 'updating' : 'creating'
				} the attribute`,
			);
		} finally {
			if (!isEditMode && setLoading) {
				setLoading(false);
			}
		}
	});

	const watchType = methods.watch('type');

	return (
		<FormProvider {...methods}>
			<form onSubmit={handleSubmit} className='py-6'>
				<div className='flex w-full max-w-[720px] flex-col gap-y-8'>
					<div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
						<Form.Field
							control={methods.control}
							name='title'
							render={({ field }) => (
								<Form.Item>
									<Form.Label>{t('fields.title')}</Form.Label>
									<Form.Control>
										<Input autoComplete='off' {...field} />
									</Form.Control>
									<Form.ErrorMessage />
									<Form.Hint>
										Give your attribute a short and clear title.
									</Form.Hint>
								</Form.Item>
							)}
						/>
						<Form.Field
							control={methods.control}
							name='code'
							render={({ field }) => (
								<Form.Item>
									<Form.Label>Code</Form.Label>
									<div className='flex justify-between [&_div.relative]:grow'>
										<Form.Control className='grow'>
											<Input
												readOnly={isEditMode || !isCodeEditable}
												disabled={isEditMode}
												autoComplete='off'
												className={`${
													isCodeEditable ? 'opacity-100' : 'opacity-50'
												}`}
												{...field}
											/>
										</Form.Control>
										{!isEditMode && (
											<Button
												variant={isCodeEditable ? 'primary' : 'secondary'}
												size='small'
												type='button'
												className='ml-2'
												onClick={() => setIsCodeEditable(!isCodeEditable)}
											>
												<PencilSquare />
											</Button>
										)}
									</div>
									<Form.ErrorMessage />
									<Form.Hint>
										{isEditMode
											? 'The code of the attribute. This cannot be changed.'
											: 'The code of the attribute. Click the edit icon to modify.'}
									</Form.Hint>
								</Form.Item>
							)}
						/>
						<Form.Field
							control={methods.control}
							name='description'
							render={({ field }) => (
								<Form.Item className='md:col-span-2'>
									<Form.Label optional>{t('fields.description')}</Form.Label>
									<Form.Control>
										<Textarea autoComplete='off' {...field} />
									</Form.Control>
									<Form.ErrorMessage />
									<Form.Hint>
										Give your attribute a short and clear description.
									</Form.Hint>
								</Form.Item>
							)}
						/>
						<Form.Field
							control={methods.control}
							name='metadata.description_en'
							render={({ field }) => (
								<Form.Item className='md:col-span-2'>
									<Form.Label optional>Description (EN)</Form.Label>
									<Form.Control>
										<Textarea
											autoComplete='off'
											{...field}
											value={(field.value as string) || ''}
										/>
									</Form.Control>
									<Form.ErrorMessage />
									<Form.Hint>
										Give your attribute a short and clear description in
										English.
									</Form.Hint>
								</Form.Item>
							)}
						/>

						<div className='flex flex-col space-y-2 md:col-span-2 '>
							<Form.Label>Product Attribute Categories</Form.Label>
							<div className='mt-2'>
								{isLoadingCategories || isCategoriesLoading ? (
									<p className='text-sm text-gray-500'>Loading categories...</p>
								) : categoryOptions.length > 0 ? (
									<Combobox
										value={selectedCategories}
										onChange={(values) => setSelectedCategories(values || [])}
										options={categoryOptions}
										placeholder='Select categories'
									/>
								) : (
									<p className='text-sm text-gray-500'>No categories found</p>
								)}
							</div>
							<Form.Hint className='mt-2'>
								Select the attribute categories for this attribute.
							</Form.Hint>
						</div>

						<Form.Field
							control={methods.control}
							name='type'
							render={({ field: { onChange, value, ...rest } }) => (
								<Form.Item className='md:col-span-2'>
									<Form.Label>{t('fields.type')}</Form.Label>
									<Form.Control>
										<Select
											value={value as string}
											onValueChange={(newValue) => onChange(newValue)}
											{...rest}
										>
											<Select.Trigger>
												<Select.Value placeholder='Select attribute type' />
											</Select.Trigger>
											<Select.Content>
												{attributeTypes.map((item) => (
													<Select.Item key={item.value} value={item.value}>
														{item.label}
													</Select.Item>
												))}
											</Select.Content>
										</Select>
									</Form.Control>
									<Form.ErrorMessage />
									<Form.Hint>Select the type of attribute.</Form.Hint>
								</Form.Item>
							)}
						/>
						<Form.Field
							control={methods.control}
							name='status'
							render={({ field: { value, onChange, ...field } }) => (
								<Form.Item>
									<div className='flex items-start justify-between'>
										<Form.Label>Status</Form.Label>
										<Form.Control>
											<Switch
												{...field}
												checked={value}
												onCheckedChange={onChange}
											/>
										</Form.Control>
									</div>
									<Form.ErrorMessage />
									<Form.Hint>
										Determine if this attribute is enabled or disabled.
									</Form.Hint>
								</Form.Item>
							)}
						/>
						{(watchType === 'select' ||
							watchType === 'multiselect' ||
							watchType === 'swatch_visual') && (
							<Form.Field
								control={methods.control}
								name='is_filterable'
								render={({ field: { value, onChange, ...field } }) => (
									<Form.Item>
										<div className='flex items-start justify-between'>
											<Form.Label>Filterable</Form.Label>
											<Form.Control>
												<Switch
													{...field}
													checked={value}
													onCheckedChange={onChange}
												/>
											</Form.Control>
										</div>
										<Form.ErrorMessage />
										<Form.Hint>
											Determine if this attribute can be used for filtering
											products.
										</Form.Hint>
									</Form.Item>
								)}
							/>
						)}

						<Form.Field
							control={methods.control}
							name='use_in_product_variant'
							render={({ field: { value, onChange, ...field } }) => (
								<Form.Item>
									<div className='flex items-start justify-between'>
										<Form.Label>Use in Product Variant</Form.Label>
										<Form.Control>
											<Switch
												{...field}
												checked={value}
												onCheckedChange={onChange}
											/>
										</Form.Control>
									</div>
									<Form.ErrorMessage />
									<Form.Hint>
										Determine if this attribute is used in product variant.
									</Form.Hint>
								</Form.Item>
							)}
						/>

						<Form.Field
							control={methods.control}
							name='is_default'
							render={({ field: { value, onChange, ...field } }) => (
								<Form.Item>
									<div className='flex items-start justify-between'>
										<Form.Label>Default Attribute</Form.Label>
										<Form.Control>
											<Switch
												{...field}
												checked={value}
												onCheckedChange={onChange}
											/>
										</Form.Control>
									</div>
									<Form.ErrorMessage />
									<Form.Hint>
										Set as default attribute for this category.
									</Form.Hint>
								</Form.Item>
							)}
						/>

						{/* <Form.Field
              control={methods.control}
              name="is_required"
              render={({ field: { value, onChange, ...field } }) => (
                <Form.Item>
                  <div className="flex items-start justify-between">
                    <Form.Label>Required</Form.Label>
                    <Form.Control>
                      <Switch
                        {...field}
                        checked={value}
                        onCheckedChange={onChange}
                      />
                    </Form.Control>
                  </div>
                  <Form.ErrorMessage />
                  <Form.Hint>
                    Determine if this attribute is required for all products.
                  </Form.Hint>
                </Form.Item>
              )}
            /> */}
						<Form.Field
							control={methods.control}
							name='is_unique'
							render={({ field: { value, onChange, ...field } }) => (
								<Form.Item>
									<div className='flex items-start justify-between'>
										<Form.Label>Unique</Form.Label>
										<Form.Control>
											<Switch
												{...field}
												checked={value}
												onCheckedChange={onChange}
											/>
										</Form.Control>
									</div>
									<Form.ErrorMessage />
									<Form.Hint>
										Determine if this attribute should have unique values across
										products.
									</Form.Hint>
								</Form.Item>
							)}
						/>
						<Form.Field
							control={methods.control}
							name='rank'
							render={({ field }) => (
								<Form.Item className='md:col-span-2'>
									<Form.Label>Rank</Form.Label>
									<Form.Control>
										<Input
											type='number'
											min='0'
											{...field}
											onChange={(e) =>
												field.onChange(Number.parseInt(e.target.value, 10))
											}
										/>
									</Form.Control>
									<Form.ErrorMessage />
									<Form.Hint>
										Set the rank of this attribute. Lower rank attributes appear
										first.
									</Form.Hint>
								</Form.Item>
							)}
						/>
					</div>
					<Button type='submit'>
						{isEditMode ? 'Update Attribute' : 'Create Attribute'}
					</Button>
				</div>
			</form>
		</FormProvider>
	);
};

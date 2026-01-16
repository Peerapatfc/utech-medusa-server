import type { ProductAttribute } from '@customTypes/attribute';
import { zodResolver } from '@hookform/resolvers/zod';
import type { HttpTypes } from '@medusajs/types';
import { Button, Input, Select, Switch, toast } from '@medusajs/ui';
import { useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { Form } from '../../../../../../components/common/form';
import { ChipInput } from '../../../../../../components/inputs/chip-input';
import { Combobox } from '../../../../../../components/inputs/combobox';
import {
	RouteDrawer,
	useRouteModal,
} from '../../../../../../components/route-modal';
import { KeyboundForm } from '../../../../../../components/utilities/keybound-form';

type EditProductOptionsFormProps = {
	product: HttpTypes.AdminProduct;
};

const CreateProductOptionSchema = z.object({
	title: z.string().min(1),
	values: z.array(z.string()).optional(),
	additional_data: z
		.object({
			use_custom_product_attribute: z.boolean().optional(),
			product_attribute_id: z.string().optional(),
		})
		.optional(),
});

export const CreateProductOptionForm = ({
	product,
}: EditProductOptionsFormProps) => {
	const { t } = useTranslation();
	const { handleSuccess } = useRouteModal();
	const queryClient = useQueryClient();
	const form = useForm<z.infer<typeof CreateProductOptionSchema>>({
		defaultValues: {
			title: '',
			values: [],
			additional_data: {
				use_custom_product_attribute: false,
				product_attribute_id: undefined,
			},
		},
		resolver: zodResolver(CreateProductOptionSchema),
	});
	const revalidateProductOptions = () => {
		queryClient.invalidateQueries({ queryKey: ["products", "detail", product.id], exact: false });
	};
	const createOption = async (data: any) => {
		const response = await axios.post(
			`/admin/products/${product.id}/options`,
			data,
			{
				withCredentials: true,
			},
		);
		return response.data;
	};
	const handleSubmit = form.handleSubmit(async (values) => {
		try {
			const option = await createOption(values);
			revalidateProductOptions();
			if (values.additional_data?.use_custom_product_attribute) {
				option.product.options[0].id;
				// Get current attribute data including metadata
				const attributeResponse = await axios.get(
					`/admin/product-attributes/${values.additional_data.product_attribute_id}`,
					{
						withCredentials: true,
					},
				);
				const currentMetadata =
					attributeResponse?.data?.attributes?.[0]?.metadata || {};

				// Handle product_id in metadata
				let updatedProductIds = [];
				if (currentMetadata.product_id) {
					// If product_id exists, ensure it's an array
					const existingIds = Array.isArray(currentMetadata.product_id)
						? currentMetadata.product_id
						: [currentMetadata.product_id];

					// Add new product.id if it doesn't exist
					if (!existingIds.includes(product.id)) {
						updatedProductIds = [...existingIds, product.id];
					} else {
						updatedProductIds = existingIds;
					}
				} else {
					// If no product_id exists yet, create new array with current product.id
					updatedProductIds = [product.id];
				}

				// Update attribute with merged metadata
				await axios.put(
					`/admin/product-attributes/${values.additional_data.product_attribute_id}`,
					{
						metadata: {
							...currentMetadata,
							product_id: updatedProductIds,
						},
					},
					{
						withCredentials: true,
					},
				);
				await axios.post(`/admin/products/${product.id}`, {
					metadata: {
						...product.metadata,
						is_swatch_or_visual: true,
					},
				});
			} else {
				await axios.post(`/admin/products/${product.id}`, {
					metadata: {
						...product.metadata,
						is_swatch_or_visual: false,
					},
				});
			}

			toast.success(
				t('products.options.create.successToast', {
					title: values.title,
				}),
			);
			handleSuccess();
		} catch (err: any) {
			console.error(err);
			toast.error(err.message);
		}
	});

	const [attributes, setAttributes] = useState<ProductAttribute[]>([]);
	const [attributeValues, setAttributeValues] = useState<ProductAttribute[]>(
		[],
	);

	const fetchAttributeOptions = async (attributeId: string) => {
		try {
			const response = await fetch(
				`/admin/product-attributes/${attributeId}/options`,
				{
					credentials: 'include',
				},
			);
			const data = await response.json();

			setAttributeValues(data.options);
		} catch (error) {
			console.error('Error fetching attribute options:', error);
			setAttributeValues([]);
		}
	};

	useEffect(() => {
		const fetchAttributes = async () => {
			try {
				const response = await fetch(
					'/admin/product-attributes?status=true&use_in_product_variant=true',
					{
						credentials: 'include',
					},
				);

				const data = await response.json();
				setAttributes(data.attributes);
			} catch (error) {
				console.error('Error fetching attributes:', error);
				setAttributes([]);
			}
		};
		fetchAttributes();
	}, []);

	useEffect(() => {
		const selectedAttributeId = form.watch(
			'additional_data.product_attribute_id',
		);
		if (selectedAttributeId) {
			const selectedAttribute = attributes.find(
				(attr) => String(attr.id) === selectedAttributeId,
			);
			if (selectedAttribute) {
				form.setValue('title', selectedAttribute.title);
				fetchAttributeOptions(selectedAttributeId);
			}
		}
	}, [form.watch('additional_data.product_attribute_id'), attributes]);

	return (
		<RouteDrawer.Form form={form}>
			<KeyboundForm
				onSubmit={handleSubmit}
				className='flex flex-1 flex-col overflow-hidden'
			>
				<RouteDrawer.Body className='flex flex-1 flex-col gap-y-4 overflow-auto'>
					<Form.Field
						control={form.control}
						name='additional_data.use_custom_product_attribute'
						render={({ field }) => {
							return (
								<Form.Item>
									<Form.Label>
										Use option from custom product attributes
									</Form.Label>
									<Form.Control>
										<Switch
											checked={field.value}
											onCheckedChange={field.onChange}
										/>
									</Form.Control>

									<Form.ErrorMessage />
								</Form.Item>
							);
						}}
					/>
					{form.watch('additional_data.use_custom_product_attribute') && (
						<Form.Field
							control={form.control}
							name='additional_data.product_attribute_id'
							render={({ field: { value, onChange } }) => {
								return (
									<Form.Item>
										<Form.Label>Attribute</Form.Label>
										<Form.Control>
											<Select
												value={value as string}
												onValueChange={(newValue) => onChange(newValue)}
											>
												<Select.Trigger>
													<Select.Value placeholder='Select attribute type' />
												</Select.Trigger>
												<Select.Content>
													<Select.Item value={null}>
														<span>Select an attribute</span>
													</Select.Item>
													{attributes.map((item) => (
														<Select.Item key={item.id} value={String(item.id)}>
															{item.title}
														</Select.Item>
													))}
												</Select.Content>
											</Select>
										</Form.Control>
									</Form.Item>
								);
							}}
						/>
					)}
					<Form.Field
						control={form.control}
						name='title'
						render={({ field }) => {
							return (
								<Form.Item>
									<Form.Label>
										{t('products.fields.options.optionTitle')}
									</Form.Label>
									<Form.Control>
										<Input
											{...field}
											placeholder={t(
												'products.fields.options.optionTitlePlaceholder',
											)}
											disabled={form.watch(
												'additional_data.use_custom_product_attribute',
											)}
										/>
									</Form.Control>
									<Form.ErrorMessage />
								</Form.Item>
							);
						}}
					/>
					<Form.Field
						control={form.control}
						name='values'
						render={({ field }) => {
							return (
								<Form.Item>
									<Form.Label>
										{t('products.fields.options.variations')}
									</Form.Label>
									<Form.Control>
										{form.watch(
											'additional_data.use_custom_product_attribute',
										) ? (
											<Combobox
												value={field.value}
												onChange={field.onChange}
												options={attributeValues.map((option) => ({
													value: option.value,
													label: option.title || option.value,
												}))}
												placeholder={t(
													'products.fields.options.variantionsPlaceholder',
												)}
												multiple
											/>
										) : (
											<ChipInput
												{...field}
												placeholder={t(
													'products.fields.options.variantionsPlaceholder',
												)}
											/>
										)}
									</Form.Control>
									<Form.ErrorMessage />
								</Form.Item>
							);
						}}
					/>
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
			</KeyboundForm>
		</RouteDrawer.Form>
	);
};

import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input } from '@medusajs/ui';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import type { HttpTypes } from '@medusajs/types';
import { Form } from '../../../../../../../../components/common/form';
import { ChipInput } from '../../../../../../../../components/inputs/chip-input';
import {
	RouteDrawer,
	useRouteModal,
} from '../../../../../../../../components/route-modal';
import { KeyboundForm } from '../../../../../../../../components/utilities/keybound-form';
import { useUpdateProductOption } from '../../../../../../../../hooks/api/products';
import type {
	ProductAttributeOption,
	ProductAttribute,
} from '@customTypes/attribute';
import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';

import { Combobox } from '../../../../../../../../components/inputs/combobox';

type EditProductOptionFormProps = {
	option: HttpTypes.AdminProductOption;
};

const EditProductOptionSchema = z.object({
	title: z.string().min(1),
	values: z.array(z.string()).optional(),
});

export const EditProductOptionForm = ({
	option,
}: EditProductOptionFormProps) => {
	const { t } = useTranslation();
	const { handleSuccess } = useRouteModal();
	const { id, option_id } = useParams();

	const form = useForm<z.infer<typeof EditProductOptionSchema>>({
		defaultValues: {
			title: option.title,
			values: option.values.map((v: any) => v.value),
		},
		resolver: zodResolver(EditProductOptionSchema),
	});

	const { mutateAsync, isPending } = useUpdateProductOption(
		option.product_id,
		option.id,
	);

	const handleSubmit = form.handleSubmit(async (values) => {
		mutateAsync(
			{
				id: option.id,
				...values,
			},
			{
				onSuccess: () => {
					handleSuccess();
				},
			},
		);
	});

	const [attributeValues, setAttributeValues] = useState<
		ProductAttributeOption[]
	>([]);
	const [attributes, setAttributes] = useState<ProductAttribute[]>([]);
	const [isAttributeInProduct, setIsAttributeInProduct] =
		useState<boolean>(false);

	const fetchAttributeOptions = useCallback(async (attributeId: string) => {
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
	}, []);

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

				for (const attribute of data.attributes) {
					if (
						attribute.metadata?.product_id?.includes(id ?? '') &&
						option.title === attribute.title
					) {
						setIsAttributeInProduct(true);
						const options = await fetchAttributeOptions(attribute.id);
						setAttributes((prevAttributes) =>
							prevAttributes.map((attr) =>
								attr.id === attribute.id ? { ...attr, options } : attr,
							),
						);
					}
				}
			} catch (error) {
				console.error('Error fetching attributes:', error);
				setAttributes([]);
			}
		};
		fetchAttributes();
	}, [id]);

	return (
		<RouteDrawer.Form form={form}>
			<KeyboundForm
				onSubmit={handleSubmit}
				className='flex flex-1 flex-col overflow-hidden'
			>
				<RouteDrawer.Body className='flex flex-1 flex-col gap-y-4 overflow-auto'>
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
											disabled={isAttributeInProduct}
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
						render={({ field: { value, onChange, ...field } }) => {
							return (
								<Form.Item>
									<Form.Label>
										{t('products.fields.options.variations')}
									</Form.Label>
									<Form.Control>
										{isAttributeInProduct ? (
											<Combobox
												{...field}
												value={
													Array.isArray(value) && value.length > 0 ? value : []
												}
												onChange={onChange}
												options={attributeValues.map((attr) => ({
													label: attr.title,
													value: attr.value,
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
						<Button type='submit' size='small' isLoading={isPending}>
							{t('actions.save')}
						</Button>
					</div>
				</RouteDrawer.Footer>
			</KeyboundForm>
		</RouteDrawer.Form>
	);
};

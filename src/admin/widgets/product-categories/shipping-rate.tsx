import { zodResolver } from '@hookform/resolvers/zod';
import { defineWidgetConfig } from '@medusajs/admin-sdk';
import { Button, CurrencyInput, toast } from '@medusajs/ui';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { z } from 'zod';
import { currencies } from '../../../admin/lib/data/currencies';
import { Form } from '../../components/common/form';

const ShippingRateSchema = z.object({
	shipping_rate: z.number().nullable(),
});

type ShippingRateFormValues = z.infer<typeof ShippingRateSchema>;

const fetchCategoryData = async (id: string) => {
	const response = await fetch(`/admin/product-categories/${id}`);
	return response.json();
};

const updateShippingRate = async (id: string, shippingRate: number | null) => {
	const response = await fetch(`/admin/product-categories/${id}`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			metadata: {
				shipping_rate: shippingRate,
			},
		}),
	});

	if (!response.ok) {
		throw new Error('Update failed');
	}
	return response;
};

const ShippingRateWidget = () => {
	const { id } = useParams();
	const currency = currencies.THB;

	const form = useForm<ShippingRateFormValues>({
		defaultValues: {
			shipping_rate: null,
		},
		resolver: zodResolver(ShippingRateSchema),
	});

	const currentValue = form.watch('shipping_rate');

	useEffect(() => {
		const loadCategoryData = async () => {
			if (!id) return;

			try {
				const data = await fetchCategoryData(id);
				const shippingRate = data.product_category?.metadata?.shipping_rate;

				if (shippingRate !== undefined) {
					form.reset({
						shipping_rate: Number(shippingRate) || null,
					});
				}
			} catch (error) {
				console.error('Failed to fetch category:', error);
				toast.error('Failed to load shipping rate');
			}
		};

		loadCategoryData();
	}, [id, form.reset]);

	const handleSubmit = async (data: ShippingRateFormValues) => {
		if (!id || (data.shipping_rate !== null && data.shipping_rate < 0)) {
			return;
		}

		try {
			await updateShippingRate(id, data.shipping_rate);
			form.reset({ shipping_rate: data.shipping_rate });
			toast.success('Shipping rate updated successfully');
		} catch (error) {
			console.error('Failed to update shipping rate:', error);
			toast.error('Failed to update shipping rate');
		}
	};

	const handleShippingRateChange = (value: string | undefined) => {
		form.setValue('shipping_rate', value ? Number(value) : null);
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(handleSubmit)}>
				<div className='shadow-elevation-card-rest bg-ui-bg-base w-full rounded-lg divide-y p-0'>
					<div className='flex items-center justify-between px-6 py-4'>
						<div>
							<h2 className='font-sans font-medium h2-core'>Shipping Rate</h2>
						</div>
					</div>
					<div className='text-ui-fg-subtle grid grid-cols-2 items-center justify-between gap-3 px-6 py-4'>
						<Form.Field
							control={form.control}
							name='shipping_rate'
							render={({ field: { onChange, value, ...field } }) => (
								<Form.Item>
									<Form.Control>
										<CurrencyInput
											min={0}
											onValueChange={handleShippingRateChange}
											code={currency.code}
											symbol={currency.symbol_native}
											{...field}
											value={value === null ? '' : value}
										/>
									</Form.Control>
									<Form.ErrorMessage />
								</Form.Item>
							)}
						/>
						<div>
							<Button
								variant='primary'
								size='small'
								type='submit'
								disabled={currentValue !== null && currentValue < 0}
							>
								Save
							</Button>
						</div>
					</div>
				</div>
			</form>
		</Form>
	);
};

export const config = defineWidgetConfig({
	zone: 'product_category.details.side.after',
});

export default ShippingRateWidget;

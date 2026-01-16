import { zodResolver } from '@hookform/resolvers/zod';
import {
	Button,
	CurrencyInput,
	DatePicker,
	Heading,
	Input,
	Text,
	toast,
} from '@medusajs/ui';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { z } from 'zod';
import { Form } from '../../../../../components/common/form';
import {
	RouteFocusModal,
	useRouteModal,
} from '../../../../../components/modals';
import { KeyboundForm } from '../../../../../components/utilities/keybound-form';
import {
	usePreOrderTemplate,
	useUpdatePreOrderTemplate,
} from '../../../../../hooks/api/pre-order-template';
import { useEffect } from 'react';
import { currencies } from '../../../../../lib/data/currencies';

const EditPreOrderTemplateSchema = z.object({
	name_th: z.string().min(1),
	shipping_start_date: z.date().nullish(),
	pickup_start_date: z.date().nullish(),
	upfront_price: z.number(),
});

export const EditPreOrderTemplateForm = () => {
	const { t } = useTranslation();
	const { handleSuccess } = useRouteModal();
	const currency = currencies.THB;

	const { id } = useParams();
	if (!id) {
		return null;
	}

	const { pre_order_template: preOrderTemplate } = usePreOrderTemplate(id, {});

	const form = useForm<z.infer<typeof EditPreOrderTemplateSchema>>({
		defaultValues: {
			name_th: '',
			shipping_start_date: null,
			pickup_start_date: null,
			upfront_price: 5000,
		},
		resolver: zodResolver(EditPreOrderTemplateSchema),
	});

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (preOrderTemplate?.id) {
			const data = {
				name_th: preOrderTemplate.name_th,
				upfront_price: preOrderTemplate.upfront_price,
				shipping_start_date: preOrderTemplate.shipping_start_date
					? new Date(preOrderTemplate.shipping_start_date)
					: null,
				pickup_start_date: preOrderTemplate.pickup_start_date
					? new Date(preOrderTemplate.pickup_start_date)
					: null,
			};
			form.reset(data);
		}
	}, [form.reset, preOrderTemplate?.id]);

	const { mutateAsync, isPending } = useUpdatePreOrderTemplate(id);

	const handleSubmit = form.handleSubmit(
		async (values: z.infer<typeof EditPreOrderTemplateSchema>) => {
			await mutateAsync(
				{
					name_th: values.name_th,
					name_en: values.name_th,
					shipping_start_date: values.shipping_start_date
						? values.shipping_start_date?.toISOString()
						: null,
					pickup_start_date: values.pickup_start_date
						? values.pickup_start_date?.toISOString()
						: null,
					upfront_price: values.upfront_price,
				},
				{
					onSuccess: () => {
						toast.success('Pre-order Campaign updated successfully');

						// handleSuccess(`/pre-order-campaigns/${id}`);
						window.location.href = `/app/pre-order-campaigns/${id}`;
					},
					onError: (e) => {
						toast.error(e.message);
					},
				},
			);
		},
	);

	return (
		<RouteFocusModal.Form form={form}>
			<KeyboundForm
				onSubmit={handleSubmit}
				className='flex flex-col overflow-hidden'
			>
				<RouteFocusModal.Header>
					<div className='flex items-center justify-end gap-x-2'>
						<RouteFocusModal.Close asChild>
							<Button size='small' variant='secondary'>
								{t('actions.cancel')}
							</Button>
						</RouteFocusModal.Close>
						<Button
							size='small'
							variant='primary'
							type='submit'
							isLoading={isPending}
						>
							{t('actions.save')}
						</Button>
					</div>
				</RouteFocusModal.Header>
				<RouteFocusModal.Body className='flex flex-col items-center overflow-y-auto p-16'>
					<div className='flex w-full max-w-[720px] flex-col gap-y-8'>
						<div>
							<Heading>
								{/* {t("productTypes.create.header")} */}
								Edit Pre-order
							</Heading>
							<Text size='small' className='text-ui-fg-subtle'>
								{/* {t("productTypes.create.hint")} */}
								Edit a Pre-order Campaign
							</Text>
						</div>
						<div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
							<Form.Field
								control={form.control}
								name='name_th'
								defaultValue={preOrderTemplate?.name_th}
								render={({ field }) => {
									return (
										<Form.Item>
											<Form.Label>Name</Form.Label>
											<Form.Control>
												<Input {...field} />
											</Form.Control>
											<Form.ErrorMessage />
										</Form.Item>
									);
								}}
							/>
						</div>
						<div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
							<Form.Field
								control={form.control}
								name='shipping_start_date'
								render={({ field }) => {
									return (
										<Form.Item>
											<div className='flex flex-col'>
												<Form.Label>Shipping Date</Form.Label>
											</div>
											<Form.Control>
												<DatePicker
													granularity='day'
													shouldCloseOnSelect={true}
													{...field}
												/>
											</Form.Control>
											<Form.ErrorMessage />
										</Form.Item>
									);
								}}
							/>
						</div>

						<div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
							<Form.Field
								control={form.control}
								name='pickup_start_date'
								render={({ field }) => {
									return (
										<Form.Item>
											<div className='flex flex-col'>
												<Form.Label>In-Store Pickup Date</Form.Label>
											</div>
											<Form.Control>
												<DatePicker
													granularity='day'
													shouldCloseOnSelect={true}
													{...field}
												/>
											</Form.Control>
											<Form.ErrorMessage />
										</Form.Item>
									);
								}}
							/>
						</div>

						<div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
							<Form.Field
								control={form.control}
								name='upfront_price'
								render={({ field: { onChange, value, ...field } }) => {
									return (
										<Form.Item>
											<Form.Label>Down Payment</Form.Label>
											<Form.Control>
												{/* <Input
													type='number'
													min={0}
													value={value || ''}
													onChange={(e) => {
														const value = e.target.value;

														if (value === '') {
															onChange(null);
														} else {
															onChange(Number.parseFloat(value));
														}
													}}
													{...field}
												/> */}
												<CurrencyInput
													min={0}
													onValueChange={(value) =>
														onChange(value ? Number.parseInt(value) : null)
													}
													code={currency.code}
													symbol={currency.symbol_native}
													{...field}
													value={value || undefined}
												/>
											</Form.Control>
											<Form.ErrorMessage />
										</Form.Item>
									);
								}}
							/>
						</div>
					</div>
				</RouteFocusModal.Body>
			</KeyboundForm>
		</RouteFocusModal.Form>
	);
};

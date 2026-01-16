import { zodResolver } from '@hookform/resolvers/zod';
import {
	Button,
	DatePicker,
	Heading,
	Input,
	Text,
	toast,
	CurrencyInput,
} from '@medusajs/ui';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { Form } from '../../../../components/common/form';
import { RouteFocusModal, useRouteModal } from '../../../../components/modals';
import { KeyboundForm } from '../../../../components/utilities/keybound-form';
import { useCreatePreOrderTemplate } from '../../../../hooks/api/pre-order-template';
import { currencies } from '../../../../lib/data/currencies';

const CreatePreOrderTemplateSchema = z.object({
	name_th: z.string().min(1),
	shipping_start_date: z.date().nullish(),
	pickup_start_date: z.date().nullish(),
	upfront_price: z.number(),
});

export const CreatePreOrderTemplateForm = () => {
	const { t } = useTranslation();
	const { handleSuccess } = useRouteModal();

	const form = useForm<z.infer<typeof CreatePreOrderTemplateSchema>>({
		defaultValues: {
			name_th: '',
			shipping_start_date: null,
			pickup_start_date: null,
			upfront_price: 5000,
		},
		resolver: zodResolver(CreatePreOrderTemplateSchema),
	});

	const { mutateAsync, isPending } = useCreatePreOrderTemplate();

	const handleSubmit = form.handleSubmit(
		async (values: z.infer<typeof CreatePreOrderTemplateSchema>) => {
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
					onSuccess: ({ id, name_th }) => {
						toast.success(`Pre-order Campaign "${name_th}" created`);

						handleSuccess(`/pre-order-campaigns/${id}`);
					},
					onError: (e) => {
						toast.error(e.message);
					},
				},
			);
		},
	);

	const currency = currencies.THB;

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
							{t('actions.create')}
						</Button>
					</div>
				</RouteFocusModal.Header>
				<RouteFocusModal.Body className='flex flex-col items-center overflow-y-auto p-16'>
					<div className='flex w-full max-w-[720px] flex-col gap-y-8'>
						<div>
							<Heading>
								{/* {t("productTypes.create.header")} */}
								Create Pre-order
							</Heading>
							<Text size='small' className='text-ui-fg-subtle'>
								{/* {t("productTypes.create.hint")} */}
								Create a new Pre-order Campaign
							</Text>
						</div>
						<div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
							<Form.Field
								control={form.control}
								name='name_th'
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

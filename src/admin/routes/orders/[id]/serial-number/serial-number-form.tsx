import { Button, Heading, Input, Text, toast } from '@medusajs/ui';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import type { AdminOrder } from '@medusajs/framework/types';
import { z } from 'zod';
import { RouteFocusModal, useRouteModal } from '../../../../components/modals';
import { KeyboundForm } from '../../../../components/utilities/keybound-form';
import {
	useOrder,
	useSaveOrderItemSerialNumber,
} from '../../../../hooks/api/orders';
import { Thumbnail } from '../../../../components/common/thumbnail';
import { Form } from '../../../../components/common/form';

type Item = {
	id: string;
	title: string;
	variant_sku: string | null;
	product_title: string | null;
	thumbnail: string | null;
	serial_number: string;
};

type FormData = {
	items: Item[];
};

const OrderSerialNumberSchema = z.object({
	items: z.array(
		z.object({
			id: z.string(),
			serial_number: z.string().optional(),
		}),
	),
});

export const SerialNumberForm = () => {
	const { handleSuccess } = useRouteModal();
	const { t } = useTranslation();
	const { id } = useParams();
	const navigate = useNavigate();

	// fetch fresh order data
	const { order: orderDetail } = useOrder(id as string, {
		fields: '*items,metadata',
	}) as { order: AdminOrder };

	const [initialData, setInitialData] = useState<FormData>({
		items: [],
	});
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		if (orderDetail?.items) {
			setInitialData({
				items: orderDetail.items.map((item) => ({
					id: item.id,
					title: item.title,
					variant_sku: item.variant_sku,
					product_title: item.product_title,
					thumbnail: item.thumbnail,
					serial_number: (item.metadata?.serial_number || '') as string,
				})),
			});
		}
	}, [orderDetail]);

	const form = useForm<FormData>({
		defaultValues: {
			items: [],
		},
		resolver: zodResolver(OrderSerialNumberSchema),
	});

	const { mutateAsync } = useSaveOrderItemSerialNumber(id as string);

	const handleSubmit = form.handleSubmit(async (data) => {
		setIsSubmitting(true);

		try {
			await mutateAsync(data);
			toast.success('Order item serial number saved');

			handleSuccess(`/orders/${id}`);
		} catch (e: any) {
			toast.error(t('general.error'), {
				description: (e.message as string) || 'Something went wrong',
			});
		} finally {
			setIsSubmitting(false);
		}
	});

	return (
		<>
			{orderDetail && (
				<RouteFocusModal.Form
					form={form}
					onClose={() => {
						navigate(`/orders/${id}`);
					}}
				>
					<KeyboundForm
						onSubmit={handleSubmit}
						className='flex h-full flex-col'
					>
						<RouteFocusModal.Header />

						<RouteFocusModal.Body className='flex size-full justify-center overflow-y-auto'>
							<div className='mt-16 w-[820px] max-w-[100%] px-4 md:p-0'>
								<Heading level='h1'>Add serial number</Heading>

								{/* List order items */}
								<div>
									<div className='mb-3 mt-8 flex items-center justify-between'>
										<Heading level='h2'>{t('fields.items')}</Heading>
									</div>

									{initialData.items.map((item, index) => (
										<div
											key={item.id}
											className='bg-ui-bg-subtle shadow-elevation-card-rest my-2 rounded-xl '
										>
											<div className='flex flex-col items-center gap-x-2 gap-y-2 p-3 text-sm md:flex-row'>
												<div className='flex flex-1 items-center justify-between'>
													<div className='flex flex-row items-center gap-x-3'>
														<Thumbnail src={item.thumbnail} />
														<div className='flex flex-col'>
															<div>
																<Text
																	className='txt-small'
																	as='span'
																	weight='plus'
																>
																	{item.title}{' '}
																</Text>

																{item.variant_sku && (
																	<span>({item.variant_sku})</span>
																)}
															</div>
															<Text
																as='div'
																className='text-ui-fg-subtle txt-small'
															>
																{item.product_title}
															</Text>
														</div>
													</div>
												</div>

												<div className='flex flex-1 items-center justify-between'>
													<div className='items-center gap-2 w-full'>
														<Form.Field
															control={form.control}
															name={`items.${index}.serial_number`}
															defaultValue={item.serial_number}
															render={({ field }) => {
																return (
																	<Form.Item className='mb-4'>
																		<Form.Label className='text-xs text-gray-400'>
																			Serial Number
																		</Form.Label>
																		<Form.Control>
																			<Input
																				{...field}
																				defaultValue={item.serial_number}
																			/>
																		</Form.Control>
																		<Form.ErrorMessage />
																	</Form.Item>
																);
															}}
														/>
													</div>
												</div>

												{/* form hidden item.id */}
												<input
													type='hidden'
													{...form.register(`items.${index}.id` as const)}
													value={item.id}
												/>
											</div>
										</div>
									))}
								</div>
							</div>
						</RouteFocusModal.Body>
						<RouteFocusModal.Footer>
							<div className='flex w-full items-center justify-end gap-x-4'>
								<div className='flex items-center justify-end gap-x-2'>
									<RouteFocusModal.Close asChild>
										<Button type='button' variant='secondary' size='small'>
											{t('actions.cancel')}
										</Button>
									</RouteFocusModal.Close>
									<Button
										key='submit-button'
										type='submit'
										variant='primary'
										size='small'
										isLoading={isSubmitting}
									>
										{t('actions.save')}
									</Button>
								</div>
							</div>
						</RouteFocusModal.Footer>
					</KeyboundForm>
				</RouteFocusModal.Form>
			)}
		</>
	);
};

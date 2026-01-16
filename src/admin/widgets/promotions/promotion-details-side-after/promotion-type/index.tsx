import { zodResolver } from '@hookform/resolvers/zod';
import { defineWidgetConfig } from '@medusajs/admin-sdk';
import type {
	AdminPromotion,
	DetailWidgetProps,
} from '@medusajs/framework/types';
import { PencilSquare } from '@medusajs/icons';
import {
	Button,
	Container,
	Heading,
	Input,
	Select,
	Text,
	toast,
} from '@medusajs/ui';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import {
	type PromotionDetail,
	PromotionType,
} from '../../../../../types/promotion';
// @ts-ignore
import CouponDiscountImage from '../../../../assets/images/coupons/discount.png';
// @ts-ignore
import CouponShippingImage from '../../../../assets/images/coupons/shipping.png';
import { ActionMenu } from '../../../../components/common/action-menu';
import { Form } from '../../../../components/common/form';
import {
	promotionsQueryKeys,
	usePromotion,
	useUpdatePromotionDetail,
} from '../../../../hooks/api/promotions';

const PromotionTypeSchema = z.object({
	promotion_type: z.string().min(1, { message: 'Required field' }),
});

const promotionTypeOptions = [
	{
		value: PromotionType.DISCOUNT,
		label: 'Discount',
		image: CouponDiscountImage,
	},
	{
		value: PromotionType.SHIPPING,
		label: 'Shipping',
		image: CouponShippingImage,
	},
];

interface CustomAdminPromotion extends AdminPromotion {
	promotion_detail: PromotionDetail;
}

const PromotionTypeWidget = ({ data }: DetailWidgetProps<AdminPromotion>) => {
	const id = data.id as string;
	const { promotion } = usePromotion(id);
	const { mutateAsync } = useUpdatePromotionDetail(id);
	const promotionWithDetail = promotion as CustomAdminPromotion;
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [isView, setIsView] = useState<boolean>(true);
	const form = useForm<z.infer<typeof PromotionTypeSchema>>({
		resolver: zodResolver(PromotionTypeSchema),
	});
	const queryClient = useQueryClient();

	const { handleSubmit, setValue } = form;

	const cancelEdit = () => {
		if (promotionWithDetail?.promotion_detail) {
			setValue(
				'promotion_type',
				promotionWithDetail.promotion_detail.promotion_type,
			);
		}
		setIsView(true);
	};

	const onSubmit = handleSubmit(
		async (data: z.infer<typeof PromotionTypeSchema>) => {
			setIsLoading(true);
			try {
				await mutateAsync({
					name: promotionWithDetail?.campaign?.name || '',
					description: promotionWithDetail?.campaign?.description || '',
					promotion_type: data.promotion_type as PromotionType,
				});

				setIsView(true);
				toast.success('Promotion type updated');
				queryClient.invalidateQueries({
					queryKey: promotionsQueryKeys.all,
				});
			} catch (e) {
				toast.error('Failed to update promotion type');
			}
			setIsLoading(false);
		},
	);

	useEffect(() => {
		if (promotionWithDetail?.promotion_detail) {
			setValue(
				'promotion_type',
				promotionWithDetail.promotion_detail.promotion_type,
			);
		}
	}, [promotionWithDetail, setValue]);

	return (
		<Container>
			<FormProvider {...form}>
				<form onSubmit={onSubmit} encType='text/plain'>
					<div className='flex items-center justify-between'>
						<Heading level='h2'>Promotion Type</Heading>

						{!isView ? (
							<div className='flex items-center gap-2'>
								<Button
									variant='primary'
									size='small'
									type='submit'
									isLoading={isLoading}
								>
									Save
								</Button>
								<Button
									variant='secondary'
									size='small'
									type='button'
									onClick={() => cancelEdit()}
								>
									Cancel
								</Button>
							</div>
						) : (
							<ActionMenu
								groups={[
									{
										actions: [
											{
												label: 'Edit',
												onClick: () => setIsView(false),
												icon: <PencilSquare />,
											},
										],
									},
								]}
							/>
						)}
					</div>

					<div className='flex flex-col items-start justify-start text-ui-fg-subtle pt-3'>
						<Form.Field
							control={form.control}
							name='promotion_type'
							render={({ field: { onChange, ref, ...field } }) => {
								return (
									<Form.Item className='w-full'>
										<Form.Control>
											{!isView ? (
												<Select
													{...field}
													disabled={isLoading || isView}
													onValueChange={onChange}
												>
													<Select.Trigger ref={ref} className='bg-ui-bg-base'>
														<Select.Value placeholder='Select Operator' />
													</Select.Trigger>

													<Select.Content>
														{promotionTypeOptions.map((option) => (
															<Select.Item
																key={option.value}
																value={option.value}
															>
																<span className='text-ui-fg-subtle'>
																	{option.label}
																</span>
															</Select.Item>
														))}
													</Select.Content>
												</Select>
											) : (
												<Input
													ref={ref}
													placeholder='Promotion Type'
													value={
														promotionTypeOptions.find(
															(option) => option.value === field.value,
														)?.label ?? ''
													}
													className='bg-ui-bg-base'
													disabled={true}
												/>
											)}
										</Form.Control>
										<Form.ErrorMessage />
										{!isView && (
											<div className='flex flex-col p-1 border rounded-md'>
												<Text size='small' className='px-1'>
													Coupon Background
												</Text>
												<a
													href={
														promotionTypeOptions.find(
															(option) => option.value === field.value,
														)?.image ?? ''
													}
													target='blank'
													className='p-1'
												>
													<img
														src={
															promotionTypeOptions.find(
																(option) => option.value === field.value,
															)?.image ?? ''
														}
														alt='coupon-bg'
														className='w-full object-cover object-center rounded-md'
													/>
												</a>
											</div>
										)}
									</Form.Item>
								);
							}}
						/>
					</div>
				</form>
			</FormProvider>
		</Container>
	);
};

export const config = defineWidgetConfig({
	zone: 'promotion.details.side.after',
});

export default PromotionTypeWidget;

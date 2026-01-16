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
	toast,
	Tooltip,
} from '@medusajs/ui';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import type { PromotionDetail } from '../../../../../types/promotion';
import { ActionMenu } from '../../../../components/common/action-menu';
import { Form } from '../../../../components/common/form';
import {
	promotionsQueryKeys,
	usePromotion,
	useUpdatePromotionDetail,
} from '../../../../hooks/api/promotions';
import { InformationCircleSolid } from '@medusajs/icons';

const PromotionLimitSchema = z.object({
	uses_per_customer: z.number().nullable(),
});

type PromotionLimitFormValues = z.infer<typeof PromotionLimitSchema>;

interface CustomAdminPromotion extends AdminPromotion {
	promotion_detail: PromotionDetail;
}

const PromotionLimitWidget = ({ data }: DetailWidgetProps<AdminPromotion>) => {
	const id = data.id as string;
	const { promotion } = usePromotion(id);
	const { mutateAsync } = useUpdatePromotionDetail(id);
	const promotionWithDetail = promotion as CustomAdminPromotion;
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [isView, setIsView] = useState<boolean>(true);
	const queryClient = useQueryClient();

	const form = useForm<PromotionLimitFormValues>({
		defaultValues: {
			uses_per_customer: null,
		},
		resolver: zodResolver(PromotionLimitSchema),
	});

	const { handleSubmit, setValue } = form;
	const currentValues = form.watch();

	const cancelEdit = () => {
		if (promotionWithDetail?.promotion_detail?.metadata) {
			const metadata = promotionWithDetail.promotion_detail.metadata;
			setValue(
				'uses_per_customer',
				metadata.uses_per_customer ? Number(metadata.uses_per_customer) : null,
			);
		}
		setIsView(true);
	};

	const onSubmit = handleSubmit(async (data: PromotionLimitFormValues) => {
		if (data.uses_per_customer !== null && data.uses_per_customer < 0) {
			return;
		}

		setIsLoading(true);
		try {
			const currentMetadata =
				promotionWithDetail?.promotion_detail?.metadata || {};

			await mutateAsync({
				name: promotionWithDetail?.campaign?.name || '',
				description: promotionWithDetail?.campaign?.description || '',
				promotion_type: promotionWithDetail?.promotion_detail?.promotion_type,
				metadata: {
					...currentMetadata,
					uses_per_customer: data.uses_per_customer,
				},
			});

			setIsView(true);
			toast.success('Promotion limits updated successfully');
			queryClient.invalidateQueries({
				queryKey: promotionsQueryKeys.all,
			});
		} catch (error) {
			console.error('Failed to update promotion limits:', error);
			toast.error('Failed to update promotion limits');
		}
		setIsLoading(false);
	});

	useEffect(() => {
		if (promotionWithDetail?.promotion_detail?.metadata) {
			const metadata = promotionWithDetail.promotion_detail.metadata;
			setValue(
				'uses_per_customer',
				metadata.uses_per_customer ? Number(metadata.uses_per_customer) : null,
			);
		}
	}, [promotionWithDetail, setValue]);

	return (
		<Container>
			<FormProvider {...form}>
				<form onSubmit={onSubmit}>
					<div className='flex items-center justify-between'>
						<Heading level='h2'>Usage Limits</Heading>

						{!isView ? (
							<div className='flex items-center gap-2'>
								<Button
									variant='primary'
									size='small'
									type='submit'
									isLoading={isLoading}
									disabled={
										isLoading ||
										(currentValues.uses_per_customer !== null &&
											currentValues.uses_per_customer < 0)
									}
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
					<div className='flex flex-col items-start justify-start text-ui-fg-subtle pt-3 gap-4'>
						<Form.Field
							control={form.control}
							name='uses_per_customer'
							render={({ field }) => (
								<Form.Item className='w-full'>
									<Form.Label>
										Uses per Customer
										<Tooltip content='Set the maximum number of times this promotion can be used by a single customer. Leave empty for unlimited usage.'>
											<InformationCircleSolid className='w-4 h-4 inline ml-2' />
										</Tooltip>
									</Form.Label>
									<Form.Control>
										<Input
											type='number'
											min={0}
											placeholder='Unlimited'
											disabled={isView}
											className='bg-ui-bg-base'
											value={field.value === null ? '' : field.value}
											onChange={(e) => {
												const value = e.target.value;
												field.onChange(value === '' ? null : Number(value));
											}}
										/>
									</Form.Control>
									<Form.ErrorMessage />
								</Form.Item>
							)}
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

export default PromotionLimitWidget;

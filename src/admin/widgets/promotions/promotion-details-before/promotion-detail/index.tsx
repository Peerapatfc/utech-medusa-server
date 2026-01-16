import { defineWidgetConfig } from '@medusajs/admin-sdk';
import type {
	AdminPromotion,
	DetailWidgetProps,
} from '@medusajs/framework/types';
import { Container, toast } from '@medusajs/ui';
import { useCallback, useEffect } from 'react';
import type { PromotionDetail } from '../../../../../types/promotion';
import { SectionRow } from '../../../../components/common/section';
import {
	usePromotion,
	useUpdatePromotionDetail,
} from '../../../../hooks/api/promotions';

interface CustomAdminPromotion extends AdminPromotion {
	promotion_detail: PromotionDetail;
}

const PromotionDetailWidget = ({ data }: DetailWidgetProps<AdminPromotion>) => {
	const id = data.id as string;
	const { promotion } = usePromotion(id);
	const { mutateAsync } = useUpdatePromotionDetail(id);
	const promotionWithDetail = promotion as CustomAdminPromotion;

	const updateDetailFromCampaign = useCallback(async () => {
		try {
			await mutateAsync({
				name: promotionWithDetail?.campaign?.name || '',
				description: promotionWithDetail?.campaign?.description || '',
				promotion_type:
					promotionWithDetail?.promotion_detail?.promotion_type || '',
			});

			toast.success('Promotion visibility updated');

			window.location.reload();
		} catch (e) {
			toast.error('Failed to update promotion visibility');
		}
	}, [
		mutateAsync,
		promotionWithDetail?.campaign?.name,
		promotionWithDetail?.campaign?.description,
		promotionWithDetail?.promotion_detail?.promotion_type,
	]);

	useEffect(() => {
		const updatePromotionIfNeeded = async () => {
			const shouldUpdateCampaign =
				promotionWithDetail?.campaign &&
				promotionWithDetail?.promotion_detail &&
				!promotionWithDetail?.promotion_detail?.name;
			if (shouldUpdateCampaign) {
				await updateDetailFromCampaign();
			}
		};

		updatePromotionIfNeeded();
	}, [promotionWithDetail, updateDetailFromCampaign]);

	return (
		<Container className='divide-y p-0'>
			<SectionRow
				key='name'
				title='Name'
				value={promotionWithDetail?.promotion_detail?.name || ''}
			/>
			<SectionRow
				key='description'
				title='Description'
				value={promotionWithDetail?.promotion_detail?.description || ''}
			/>
		</Container>
	);
};

export const config = defineWidgetConfig({
	zone: 'promotion.details.side.before',
});

export default PromotionDetailWidget;

import { defineWidgetConfig } from '@medusajs/admin-sdk';
import type {
	AdminPromotion,
	DetailWidgetProps,
} from '@medusajs/framework/types';
import { Container, Label, Switch, toast } from '@medusajs/ui';
import {
	usePromotion,
	useUpdatePromotionVisibility,
} from '../../../../hooks/api/promotions';
import type { PromotionDetail } from '../../../../../types/promotion';
import { useEffect, useState } from 'react';

interface CustomAdminPromotion extends AdminPromotion {
	promotion_detail: PromotionDetail;
}

const PromotionVisibilityWidget = ({
	data,
}: DetailWidgetProps<AdminPromotion>) => {
	const id = data.id as string;
	const { promotion, isFetched } = usePromotion(id);
	const { mutateAsync } = useUpdatePromotionVisibility(id);
	const promotionWithDetail = promotion as CustomAdminPromotion;

	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		if (isFetched && promotionWithDetail) {
			setIsVisible(!!promotionWithDetail.promotion_detail?.is_store_visible);
		}
	}, [isFetched, promotionWithDetail]);

	const handleSwitchChange = async (checked: boolean) => {
		setIsVisible(checked);

		try {
			await mutateAsync({
				is_store_visible: checked,
			});

			toast.success('Promotion visibility updated');
		} catch (e) {
			toast.error('Failed to update promotion visibility');
			setIsVisible(!checked);
		}
	};

	return (
		<Container>
			<div className='flex items-center mt-3 gap-x-2'>
				{isFetched && (
					<Switch
						id='is-store-visible'
						checked={isVisible}
						onCheckedChange={handleSwitchChange}
					/>
				)}
				<Label>Show on the store</Label>
			</div>
		</Container>
	);
};

export const config = defineWidgetConfig({
	zone: 'promotion.details.side.after',
});

export default PromotionVisibilityWidget;

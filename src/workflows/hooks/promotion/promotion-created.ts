import type { MedusaContainer } from '@medusajs/framework';
import type { PromotionDTO } from '@medusajs/framework/types';
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils';
import { createPromotionsWorkflow } from '@medusajs/medusa/core-flows';
import { logCreatePromotionFromHooks } from 'src/api/utils/helpers/promotion-logs';
import { PROMOTION_CUSTOM_MODULE } from '../../../modules/promotion-custom';
import type PromotionCustomModuleService from '../../../modules/promotion-custom/service';
import { STOREFRONT_MODULE } from '../../../modules/storefront';
import type StorefrontModuleService from '../../../modules/storefront/service';
import { CustomerGroupName } from '../../../types/customer-group';
import { getActorId } from '../../../utils/workflow-hooks';

const createPromotionDetail = async (
	promotion: PromotionDTO,
	container: MedusaContainer,
) => {
	const query = container.resolve(ContainerRegistrationKeys.QUERY);
	const { data: customer_groups } = await query.graph({
		entity: 'customer_group',
		fields: ['*'],
		filters: {
			name: {
				$in: [CustomerGroupName.MEMBER, CustomerGroupName.NEW_MEMBER],
			},
		},
		pagination: {
			take: 2,
			skip: 0,
		},
	});
	const rule_customer_group = promotion?.rules?.find(
		(rule) => rule.attribute === 'customer.groups.id' && rule.operator === 'in',
	);
	const is_new_customer = customer_groups.every((group) =>
		rule_customer_group?.values.some((value) => value.value === group.id),
	);

	const promotionCustomService: PromotionCustomModuleService =
		container.resolve(PROMOTION_CUSTOM_MODULE);

	const promotionDetail = await promotionCustomService.createPromotionDetails({
		is_store_visible: true,
		is_new_customer,
		custom_rules: {
			subtotal: null,
		},
	});

	const link = container.resolve(ContainerRegistrationKeys.LINK);
	await link.create({
		[Modules.PROMOTION]: {
			promotion_id: promotion.id,
		},
		[PROMOTION_CUSTOM_MODULE]: {
			promotion_detail_id: promotionDetail.id,
		},
	});

	// Revalidate the coupons tag
	const storefrontService: StorefrontModuleService =
		container.resolve(STOREFRONT_MODULE);
	await storefrontService.revalidateTag('coupons');
};

createPromotionsWorkflow.hooks.promotionsCreated(
	async ({ promotions, additional_data }, { container }) => {
		const [promotion] = promotions;
		await createPromotionDetail(promotion, container);

		const actorId = getActorId(additional_data);
		logCreatePromotionFromHooks(container, promotion.id, actorId);
	},
);

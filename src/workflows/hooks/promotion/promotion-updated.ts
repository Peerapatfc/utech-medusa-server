import { ContainerRegistrationKeys } from '@medusajs/framework/utils';
import { updatePromotionsWorkflow } from '@medusajs/medusa/core-flows';
import { logUpdatePromotionFromHooks } from 'src/api/utils/helpers/promotion-logs';
import { PROMOTION_CUSTOM_MODULE } from '../../../modules/promotion-custom';
import type PromotionCustomModuleService from '../../../modules/promotion-custom/service';
import { STOREFRONT_MODULE } from '../../../modules/storefront';
import type StorefrontModuleService from '../../../modules/storefront/service';
import { CustomerGroupName } from '../../../types/customer-group';
import { getActorId } from '../../../utils/workflow-hooks';

updatePromotionsWorkflow.hooks.promotionsUpdated(
	({ promotions, additional_data }, { container }) => {
		setTimeout(async () => {
			const [promotion] = promotions;
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

			const { data } = await query.graph({
				entity: 'promotion',
				fields: ['*', 'promotion_detail.*', 'rules.*', 'rules.values.*'],
				filters: {
					id: promotion.id,
				},
				pagination: {
					take: 1,
					skip: 0,
				},
			});
			const promo = data[0];

			const rule_customer_group = promo?.rules?.find(
				(rule) =>
					rule.attribute === 'customer.groups.id' && rule.operator === 'in',
			);
			const is_new_customer = customer_groups.every((group) =>
				rule_customer_group?.values.some((value) => value.value === group.id),
			);

			const promotionCustomService: PromotionCustomModuleService =
				container.resolve(PROMOTION_CUSTOM_MODULE);

			await promotionCustomService.updatePromotionDetails({
				id: promo.promotion_detail.id,
				is_new_customer,
			});

			const storefrontService: StorefrontModuleService =
				container.resolve(STOREFRONT_MODULE);
			await storefrontService.revalidateTag('coupons');

			const actorId = getActorId(additional_data);
			logUpdatePromotionFromHooks(container, promotion.id, actorId);
		}, 1000);
	},
);

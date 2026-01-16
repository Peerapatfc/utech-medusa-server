import type { CustomPromotion } from '../../../../types/promotion';
import { Modules } from '@medusajs/framework/utils';
import { createStep, StepResponse } from '@medusajs/framework/workflows-sdk';
import { isWithinPeriod } from '../../../../utils/promotion';
import { CustomerGroupName } from '../../../../types/customer-group';
import type { GetPromotionListWorkflowInput } from '../';

type StepInput = {
	promotions: CustomPromotion[];
	params: GetPromotionListWorkflowInput;
};

const mappingPromotionsStep = createStep(
	'mapping-promotion-step',
	async (input: StepInput, { container }) => {
		const { promotions, params } = input;
		const { limit, offset, is_new_customers, q } = params;
		const regex = new RegExp(q, 'i');

		const customerService = container.resolve(Modules.CUSTOMER);

		const filteredCoupons: CustomPromotion[] = [];
		for (const promotion of promotions) {
			const { code } = promotion;
			const description = promotion.campaign?.description;
			if (!promotion.campaign) {
				continue;
			}
			if (!promotion.promotion_detail?.is_store_visible) {
				continue;
			}
			if (promotion.promotion_detail?.is_new_customer !== is_new_customers) {
				continue;
			}
			if (!regex.test(code) && !regex.test(description)) {
				continue;
			}

			if (!isWithinPeriod(promotion)) {
				continue;
			}

			let isMemberOnly = false;
			const customerGroupsRule = promotion.rules.find(
				(rule) => rule.attribute === 'customer.groups.id',
			);

			if (customerGroupsRule) {
				const customerGroupsIds = customerGroupsRule.values.map(
					(value) => value.value,
				);
				const customerGroups = await customerService.listCustomerGroups({
					id: customerGroupsIds,
				});

				isMemberOnly = customerGroups.some(
					(group) => group.name === CustomerGroupName.MEMBER,
				);
			}

			promotion.is_member_only = isMemberOnly;

			const { limit, used } = promotion.campaign.budget;
			promotion.usage_exceeded = limit ? used >= limit : false;

			filteredCoupons.push(promotion);
		}

		const count = filteredCoupons.length;
		const sortedCoupons = sortCoupons(filteredCoupons);

		const coupons = sortedCoupons.slice(offset, offset + limit).map((c) => {
			return {
				...c,
				rules: undefined,
			};
		});

		return new StepResponse({
			coupons,
			count,
			offset: offset,
			limit: limit,
		});
	},
);

export default mappingPromotionsStep;

const sortCoupons = (coupons: CustomPromotion[]) => {
	if (!coupons.length) {
		return [];
	}

	const hasEndsAtCoupons = coupons.filter((c) => !!c.campaign.ends_at);
	const noEndsAtCoupons = coupons.filter((c) => !c.campaign.ends_at);

	const sortedHasEndsAtCoupons = hasEndsAtCoupons.sort((a, b) => {
		return (
			new Date(a.campaign.ends_at).getTime() -
			new Date(b.campaign.ends_at).getTime()
		);
	});

	const sortedEndsAt = [...sortedHasEndsAtCoupons, ...noEndsAtCoupons];

	const usageExceededCoupons = sortedEndsAt.filter((c) => c.usage_exceeded);
	const nonUsageExceededCoupons = sortedEndsAt.filter((c) => !c.usage_exceeded);

	return [...nonUsageExceededCoupons, ...usageExceededCoupons];
};

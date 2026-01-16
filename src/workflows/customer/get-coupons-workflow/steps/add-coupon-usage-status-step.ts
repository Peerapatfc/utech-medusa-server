import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import type { CustomPromotion } from "../../../../types/promotion";
import { CouponStatus } from "../../../../types/promotion";

interface FilterAndSortCouponsOutput {
	coupons: CustomPromotion[];
	count: number;
	offset: number;
	limit: number;
	tab?: string;
}

interface AddCouponUsageStatusInput {
	couponsData: FilterAndSortCouponsOutput;
	promotionUsage: Record<string, number>;
}

const STATUS_PRIORITY = {
	[CouponStatus.USE]: 1,
	[CouponStatus.OUT]: 2,
	[CouponStatus.EXPIRED]: 3,
};

const determineActualUsageCount = (
	coupon: CustomPromotion,
	promotionUsage: Record<string, number>,
): number => {
	return coupon.code ? promotionUsage[coupon.code] || 0 : 0;
};

const isLimitReached = (
	actualUsageCount: number,
	coupon: CustomPromotion,
): boolean => {
	const usesPerCustomer =
		Number(coupon.promotion_detail?.metadata?.uses_per_customer) ?? 0;
	return usesPerCustomer > 0 && actualUsageCount >= usesPerCustomer;
};

const isExpired = (coupon: CustomPromotion): boolean => {
	return coupon.campaign?.ends_at
		? new Date(coupon.campaign.ends_at) <= new Date()
		: false;
};

const determineCouponStatus = (
	actualUsageCount: number,
	coupon: CustomPromotion,
): CouponStatus => {
	if (isLimitReached(actualUsageCount, coupon)) {
		return CouponStatus.OUT;
	}

	if (isExpired(coupon)) {
		return CouponStatus.EXPIRED;
	}

	return CouponStatus.USE;
};

const addUsageStatusToCoupon = (
	coupon: CustomPromotion,
	promotionUsage: Record<string, number>,
): CustomPromotion => {
	const actualUsageCount = determineActualUsageCount(coupon, promotionUsage);
	const isUsed = actualUsageCount > 0;
	const couponStatus = determineCouponStatus(actualUsageCount, coupon);

	return {
		...coupon,
		is_used: isUsed,
		coupon_status: couponStatus,
	};
};

const sortCouponsByStatus = (coupons: CustomPromotion[]): CustomPromotion[] => {
	return coupons.sort((a, b) => {
		const aPriority = a.coupon_status
			? STATUS_PRIORITY[a.coupon_status] || 999
			: 999;
		const bPriority = b.coupon_status
			? STATUS_PRIORITY[b.coupon_status] || 999
			: 999;
		return aPriority - bPriority;
	});
};

const filterCouponsByTab = (
	coupons: CustomPromotion[],
	tab?: string,
): CustomPromotion[] => {
	if (!tab || tab === "all") {
		return coupons;
	}

	return coupons.filter((coupon) => {
		switch (tab) {
			case "used":
				return coupon.is_used === true;

			case "expired":
				return coupon.campaign?.ends_at
					? new Date(coupon.campaign.ends_at) <= new Date()
					: false;

			default:
				return true;
		}
	});
};

const paginateCoupons = (
	coupons: CustomPromotion[],
	offset: number,
	limit: number,
): CustomPromotion[] => {
	return coupons.slice(offset, offset + limit);
};

export const addCouponUsageStatusStep = createStep(
	"add-coupon-usage-status",
	async ({ couponsData, promotionUsage }: AddCouponUsageStatusInput) => {
		const safePromotionUsage = promotionUsage || {};

		// Add usage status to each coupon
		const couponsWithStatus = couponsData.coupons.map((coupon) =>
			addUsageStatusToCoupon(coupon, safePromotionUsage),
		);

		// Sort coupons by status priority
		const sortedCoupons = sortCouponsByStatus(couponsWithStatus);

		// Filter by tab
		const filteredCoupons = filterCouponsByTab(sortedCoupons, couponsData.tab);

		// Calculate pagination
		const totalCount = filteredCoupons.length;
		const paginatedCoupons = paginateCoupons(
			filteredCoupons,
			couponsData.offset,
			couponsData.limit,
		);

		return new StepResponse({
			coupons: paginatedCoupons,
			count: totalCount,
			offset: couponsData.offset,
			limit: couponsData.limit,
		});
	},
);

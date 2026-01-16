import { createStep, StepResponse } from '@medusajs/framework/workflows-sdk';
import type { PromotionDTO } from '@medusajs/framework/types';

type FilterAndSortCouponsOutput = {
	coupons: PromotionDTO[];
	count: number;
	offset: number;
	limit: number;
	tab?: string;
};

export const filterAndSortCouponsStep = createStep(
	'filter-and-sort-coupons',
	async ({
		promotions,
		limit,
		offset,
		tab,
		search,
	}: {
		promotions: PromotionDTO[];
		limit: number;
		offset: number;
		tab?: 'all' | 'used' | 'expired';
		search?: string;
	}) => {
		const filterBySearch = (coupons: PromotionDTO[]) => {
			return coupons.filter((coupon) => {
				if (search) {
					const matchesCode = coupon.code === search;
					const matchesDescription =
						coupon.campaign?.description.includes(search);
					if (!matchesCode && !matchesDescription) return false;
				}
				return true;
			});
		};

		const sortCoupons = (coupons: PromotionDTO[]) => {
			if (!coupons.length) {
				return [];
			}

			const now = new Date();

			const nonExpiredCoupons = coupons.filter((c) => {
				if (!c.campaign?.ends_at) return true;
				return new Date(c.campaign.ends_at) > now;
			});

			const expiredCoupons = coupons.filter((c) => {
				if (!c.campaign?.ends_at) return false;
				return new Date(c.campaign.ends_at) <= now;
			});

			const sortByEndDate = (coupons: PromotionDTO[]) => {
				const hasEndsAtCoupons = coupons.filter((c) => !!c.campaign?.ends_at);
				const noEndsAtCoupons = coupons.filter((c) => !c.campaign?.ends_at);

				const sortedHasEndsAtCoupons = hasEndsAtCoupons.sort((a, b) => {
					return (
						new Date(a.campaign.ends_at).getTime() -
						new Date(b.campaign.ends_at).getTime()
					);
				});

				return [...sortedHasEndsAtCoupons, ...noEndsAtCoupons];
			};

			const sortedNonExpired = sortByEndDate(nonExpiredCoupons);
			const sortedExpired = sortByEndDate(expiredCoupons);

			return [...sortedNonExpired, ...sortedExpired];
		};

		let filteredPromotions = promotions;
		filteredPromotions = filterBySearch(filteredPromotions);
		const sortedCoupons = sortCoupons(filteredPromotions);

		return new StepResponse({
			coupons: sortedCoupons,
			count: sortedCoupons.length,
			offset,
			limit,
			tab,
		} as FilterAndSortCouponsOutput);
	},
);

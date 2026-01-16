import {
	createWorkflow,
	WorkflowResponse,
	transform,
} from '@medusajs/framework/workflows-sdk';
import { getCustomerStep } from './steps/get-customer-step';
import { getPromotionsStep } from './steps/get-promotions-step';
import { filterAndSortCouponsStep } from './steps/filter-and-sort-coupons-step';
import { getCustomerOrdersStep } from './steps/get-customer-orders-step';
import { addCouponUsageStatusStep } from './steps/add-coupon-usage-status-step';
import type { CustomPromotion } from '../../../types/promotion';

export type GetCustomerCouponsInput = {
	customerId: string;
	limit: number;
	offset: number;
	tab?: 'all' | 'used' | 'expired';
	search?: string;
};

export type GetCustomerCouponsOutput = {
	coupons: CustomPromotion[];
	count: number;
	offset: number;
	limit: number;
};

export const getCustomerCouponsWorkflow = createWorkflow(
	'get-customer-coupons',
	(input: GetCustomerCouponsInput) => {
		// Step 1: Get customer data
		const customer = getCustomerStep({ customerId: input.customerId });

		// Step 2: Get customer orders to check coupon usage
		const customerOrders = getCustomerOrdersStep({
			customerId: input.customerId,
		});

		// Step 3: Transform customer metadata to extract couponIds
		const couponIds = transform({ customer }, (data) => {
			return (data.customer.metadata?.coupon_ids as string[]) || [];
		});

		// Step 4: Get promotions for coupon IDs
		const promotions = getPromotionsStep({ couponIds });

		// Step 5: Filter, sort, and paginate coupons
		const filteredCoupons = filterAndSortCouponsStep({
			promotions,
			limit: input.limit,
			offset: input.offset,
			tab: input.tab,
			search: input.search,
		});

		// Step 6: Add usage status to coupons
		const result = addCouponUsageStatusStep({
			couponsData: filteredCoupons,
			promotionUsage: customerOrders.promotionUsage,
		});

		return new WorkflowResponse(result);
	},
);

export default getCustomerCouponsWorkflow;

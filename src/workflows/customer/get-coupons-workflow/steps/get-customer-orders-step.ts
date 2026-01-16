import { createStep, StepResponse } from '@medusajs/framework/workflows-sdk';
import { ContainerRegistrationKeys } from '@medusajs/framework/utils';

type OrderWithPromotions = {
	id: string;
	status: string;
	created_at: string;
	promotions?: Array<{
		id: string;
		code: string;
		type: string;
	}>;
};

type OrderItem = {
	id: string;
	adjustments?: Array<{
		id: string;
		code?: string;
		amount: number;
	}>;
};

type OrderWithItems = OrderWithPromotions & {
	items?: OrderItem[];
	shipping_methods?: Array<{
		adjustments?: Array<{
			id: string;
			code?: string;
			amount: number;
		}>;
	}>;
};

export const getCustomerOrdersStep = createStep(
	'get-customer-orders',
	async ({ customerId }: { customerId: string }, { container }) => {
		const query = container.resolve(ContainerRegistrationKeys.QUERY);

		const { data: orders } = await query.graph({
			entity: 'order',
			fields: [
				'id',
				'items.*',
				'items.adjustments.*',
				'shipping_methods.adjustments.*',
				'customer.id',
			],
			filters: {
				customer_id: customerId,
			},
		});
		const promotionUsageCount = new Map<string, number>();

		const allPromotionCodes = (orders as OrderWithItems[])
			.flatMap((order) => [
				...(order.items?.flatMap((item) => item.adjustments || []) || []),
				...(order.shipping_methods?.flatMap(
					(method) => method.adjustments || [],
				) || []),
			])
			.map((adjustment) => adjustment.code)
			.filter(Boolean) as string[];

		for (const code of allPromotionCodes) {
			promotionUsageCount.set(code, (promotionUsageCount.get(code) || 0) + 1);
		}

		const usageCountObject = Object.fromEntries(promotionUsageCount);

		return new StepResponse({
			orders: orders as OrderWithPromotions[],
			promotionUsage: usageCountObject,
		});
	},
);

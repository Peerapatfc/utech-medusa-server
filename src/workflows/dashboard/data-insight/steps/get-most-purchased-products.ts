import type { AdminOrder } from '@medusajs/framework/types';
import { OrderStatus } from '@medusajs/framework/utils';
import { StepResponse, createStep } from '@medusajs/framework/workflows-sdk';
import { getPaymentCapturedOrder } from '../utils/get-payment-captured-order';
import type { ProductData } from './fetch-initial-product-data';

export type GetMostPurchasedProductsStepInput = {
	products: ProductData[];
	allOrders: AdminOrder[];
	limit: number;
};

export const getMostPurchasedProductsStep = createStep(
	'get-most-purchased-products-step',
	async (input: GetMostPurchasedProductsStepInput, { container }) => {
		const { products, allOrders, limit } = input;

		const onGoingOrders = allOrders.filter(
			(order) =>
				order.status === OrderStatus.PENDING ||
				order.status === OrderStatus.COMPLETED,
		);

		const capturedOrders = getPaymentCapturedOrder(onGoingOrders);

		const productMap = new Map();

		for (const order of capturedOrders) {
			for (const item of order.items) {
				if (item.product_id) {
					const existingProduct = productMap.get(item.product_id);
					if (existingProduct) {
						existingProduct.count += item.quantity;
					} else {
						productMap.set(item.product_id, {
							product_id: item.product_id,
							product_title: item.title,
							count: item.quantity,
						});
					}
				}
			}
		}

		const filteredProductMap = new Map();
		productMap.forEach((value, key) => {
			const product = products.find((product) => product.id === key);
			if (product) {
				filteredProductMap.set(key, {
					...value,
					product_title: product.title,
				});
			}
		});

		const productSummary = Array.from(filteredProductMap.values());
		productSummary.sort((a, b) => b.count - a.count);
		const limitedProductSummary = productSummary.slice(0, limit);

		return new StepResponse(limitedProductSummary);
	},
);

import type { ICartModuleService } from '@medusajs/framework/types';
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils';
import { createStep, StepResponse } from '@medusajs/framework/workflows-sdk';
import type { CartItem } from '../type';

type StepInput = {
	cartId: string;
};

export const getCartItemsStep = createStep(
	'get-cart-items-step',
	async ({ cartId }: StepInput, { container }) => {
		const cartService: ICartModuleService = container.resolve(Modules.CART);
		const query = container.resolve(ContainerRegistrationKeys.QUERY);

		// First, get cart items using retrieveCart
		const cart = await cartService.retrieveCart(cartId, {
			select: ['id', 'metadata'],
			relations: ['items'],
		});

		if (!cart || !cart.items || cart.items.length === 0) {
			return new StepResponse({
				cartItems: [],
			});
		}

		// Extract unique product IDs from cart items
		const productIds = [...new Set(cart.items.map((item) => item.product_id))];

		// Query products with their categories including mpath for hierarchy
		const { data: products } = await query.graph({
			entity: 'product',
			filters: { id: { $in: productIds } },
			fields: [
				'id',
				'title',
				'categories.id',
				'categories.name',
				'categories.handle',
				'categories.mpath',
				'categories.rank',
			],
		});

		// Create a map of product ID to categories
		const productCategoriesMap = new Map();
		for (const product of products) {
			productCategoriesMap.set(product.id, product.categories || []);
		}

		// Map cart items with their categories and sort by created_at desc
		const cartItems: CartItem[] = cart.items
			.map((item) => ({
				product_id: item.product_id,
				categories: productCategoriesMap.get(item.product_id) || [],
				created_at: item.created_at,
			}))
			.sort(
				(a, b) =>
					new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
			);

		return new StepResponse({
			cartItems,
		});
	},
);

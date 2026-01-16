import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { StepResponse, createStep } from "@medusajs/framework/workflows-sdk";
import type { ProductData } from "./fetch-initial-product-data";
import type { MostViewed } from "@customTypes/dashboard";

export type GetMostWishlistProductsStepInput = {
	limit?: number;
	products: ProductData[];
	mostViewedProductIds?: MostViewed[];
};

export const getMostWishlistProductsStep = createStep(
	"get-most-wishlist-products-step",
	async (input: GetMostWishlistProductsStepInput, { container }) => {
		const query = container.resolve(ContainerRegistrationKeys.QUERY);
		const mostViewedProductIds = input.mostViewedProductIds?.map(
			(product) => product.product_id,
		);

		const customers = await query.graph({
			entity: "customer",
			fields: ["metadata.wishlist_ids"],
			filters: {
				//@ts-ignore
				$or: mostViewedProductIds.map((productId) => ({
					metadata: {
						wishlist_ids: {
							$contains: [productId],
						},
					},
				})),
			},
		});

		const productCounts = new Map<string, number>();

		// Count occurrences of each product_id across all customers
		for (const customer of customers.data) {
			if (!customer) continue;

			const wishlistIds = Array.isArray(customer.metadata?.wishlist_ids)
				? customer.metadata?.wishlist_ids
				: [];
			for (const productId of wishlistIds) {
				productCounts.set(productId, (productCounts.get(productId) || 0) + 1);
			}
		}

		// Create a map of product ID to product title for quick lookup
		const productTitleMap = new Map<string, string>();
		for (const product of input.products) {
			productTitleMap.set(product.id, product.title);
		}

		// Convert to array and sort by count in descending order
		const sortedProducts = Array.from(productCounts.entries())
			.filter(([productId]) => {
				// If mostViewedProductIds is provided, only include those products
				return mostViewedProductIds
					? mostViewedProductIds.includes(productId)
					: true;
			})
			.sort(([, countA], [, countB]) => countB - countA)
			.slice(0, input.limit || 5)
			.map(([productId, count]) => ({
				product_id: productId,
				name: productTitleMap.get(productId) || productId,
				count,
			}));

		const chartData = sortedProducts;

		return new StepResponse(chartData);
	},
);

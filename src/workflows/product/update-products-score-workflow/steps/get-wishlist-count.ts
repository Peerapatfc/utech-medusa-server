import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { StepResponse, createStep } from "@medusajs/framework/workflows-sdk";

interface customerWithWishlistIds {
	data: { metadata: { wishlist_ids: string[] } }[];
}

export const getWishlistCountStep = createStep(
	"get-wishlist-count-step",
	async ({ product_ids }: { product_ids: string[] }, { container }) => {
		const query = container.resolve(ContainerRegistrationKeys.QUERY);

		const customers = (await query.graph({
			entity: "customer",
			fields: ["metadata.wishlist_ids"],
			filters: {
				//@ts-ignore
				$or: product_ids.map((product_id) => ({
					metadata: {
						wishlist_ids: {
							$contains: [product_id],
						},
					},
				})),
			},
		})) as unknown as customerWithWishlistIds;

		const wishlistCount = product_ids.map((product_id) => {
			const count = customers.data.reduce((acc, customer) => {
				const wishlist = customer.metadata?.wishlist_ids || [];
				return acc + wishlist.filter((id) => id === product_id).length;
			}, 0);

			return {
				id: product_id,
				wishlistCount: count,
			};
		});

		return new StepResponse({
			wishlistCount,
		});
	},
);

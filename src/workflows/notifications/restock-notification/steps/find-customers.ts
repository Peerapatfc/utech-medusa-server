import type {
	CustomerDTO,
	IProductModuleService,
	ProductVariantDTO,
} from '@medusajs/framework/types';
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils';
import { StepResponse, createStep } from '@medusajs/framework/workflows-sdk';
import type { CustomerWithProduct } from '../types';

export const findCustomersStep = createStep(
	'find-customers-with-product-in-wishlist',
	async (input: { variants: ProductVariantDTO[] }, { container }) => {
		const { variants } = input;
		const query = container.resolve(ContainerRegistrationKeys.QUERY);
		const customersWithProducts: CustomerWithProduct[] = [];
		const productService: IProductModuleService = container.resolve(
			Modules.PRODUCT,
		);

		// For each product variant, find customers with the product in their wishlist
		for (const variant of variants) {
			const customerResult = await query.graph({
				entity: 'customer',
				fields: ['id', 'metadata'],
				filters: {
					metadata: {
						wishlist_ids: {
							$contains: [variant.product_id],
						},
					},
				},
			});

			const customers = customerResult.data as unknown as CustomerDTO[];

			if (customers.length > 0 && variant.product_id) {
				const product = await productService.retrieveProduct(
					variant.product_id,
				);

				// For each customer, create a mapping of customer to the products they're interested in
				for (const customer of customers) {
					customersWithProducts.push({
						customer,
						productId: variant.product_id,
						productTitle: product.title,
					});
				}
			}
		}

		return new StepResponse({
			customersWithProducts,
			variants,
			customerIds: customersWithProducts.map((cwp) => cwp.customer.id),
		});
	},
);

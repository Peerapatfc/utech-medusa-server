import { StepResponse, createStep } from '@medusajs/framework/workflows-sdk';
import { ContainerRegistrationKeys, Modules } from '@medusajs/utils';
import type {
	PriceListCustomDTO,
	CustomerProductFlashSale,
} from '@customTypes/price-list-custom';
import type { IProductModuleService } from '@medusajs/framework/types';

type StepInput = {
	currentProductFlashSales: PriceListCustomDTO[];
};

async function handler(input: StepInput, { container }) {
	const { currentProductFlashSales } = input;
	const query = container.resolve(ContainerRegistrationKeys.QUERY);
	const productService: IProductModuleService = container.resolve(
		Modules.PRODUCT,
	);

	const customerProductFlashSales: CustomerProductFlashSale[] = [];
	for await (const flashSale of currentProductFlashSales) {
		if (!flashSale.price_list_custom.is_notification_sent) {
			const products = flashSale.price_list_custom.products;
			for await (const product of products) {
				const { data: customers } = await query.graph({
					entity: 'customer',
					fields: ['*'],
					filters: {
						metadata: {
							wishlist_ids: {
								$contains: [product.id],
							},
						},
					},
					pagination: {
						take: 9999,
						skip: 0,
					},
				});
				const _product = await productService.retrieveProduct(product.id);
				customerProductFlashSales.push({
					...flashSale,
					product: {
						id: _product.id,
						title: _product.title,
						handle: _product.handle,
						subtitle: _product.subtitle,
						description: _product.description,
						thumbnail: _product.thumbnail,
					},
					customers: customers.map((customer) => ({
						id: customer.id,
						email: customer.email,
						first_name: customer.first_name,
						last_name: customer.last_name,
						phone: customer.phone,
					})),
				});
			}
		}
	}
	return new StepResponse({ customerProductFlashSales });
}

export const getRecipient = createStep(
	'get-recipient-flash-sale-wishlist',
	handler,
);

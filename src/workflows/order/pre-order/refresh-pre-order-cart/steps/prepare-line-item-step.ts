import type { CartDTO } from '@medusajs/framework/types';
import type { IProductModuleService } from '@medusajs/framework/types';
import { Modules } from '@medusajs/framework/utils';
import { StepResponse, createStep } from '@medusajs/framework/workflows-sdk';
import { PreOrderItemType, ProductType } from '../../../../../types/pre-order';
import {
	type CustomProductVariantDTO,
	prepareLineItemData,
} from '../../../../../utils/cart/prepare-line-item-data';

interface InputLineItem {
	cart: CartDTO & {
		metadata: {
			pickup_option: { is_overide_unit_price: boolean; upfront_price: number };
		};
	};
	variants: CustomProductVariantDTO[];
}

type BundleType = {
	title_th?: string;
	title_en?: string;
	description_th?: string;
	description_en?: string;
	selectType?: string;
	products?: {
		productId?: string;
		variantId?: string;
		price?: number;
	}[];
};

const preparePreOrderLineItemStep = createStep(
	'prepare-pre-order-line-item',
	async (input: InputLineItem, _context) => {
		const { cart, variants } = input;
		const cartMetadata = cart.metadata;
		let productBundles: BundleType[] = [];
		// First find pre-order items and save their product bundles
		const preOrderItems = cart.items.filter(
			(item) => item?.product_type === ProductType.PRE_ORDER,
		);
		if (preOrderItems.length > 0) {
			const productService: IProductModuleService = _context.container.resolve(
				Modules.PRODUCT,
			);
			const preOrderProducts = [];
			for (const item of preOrderItems) {
				const product = await productService.retrieveProduct(item.product_id);
				preOrderProducts.push(product);
			}
			productBundles = preOrderProducts.flatMap(
				(product) => product.metadata?.bundles ?? [],
			);
		}

		const items = await Promise.all(
			cart.items.map(async (item) => {
				// biome-ignore lint/style/noNonNullAssertion: <explanation>
				const variant = variants.find((v) => v.id === item.variant_id)!;

				let unitPrice = variant?.calculated_price?.calculated_amount ?? 0;

				if (cartMetadata?.pickup_option?.is_overide_unit_price) {
					unitPrice = cartMetadata?.pickup_option?.upfront_price ?? 0;
				}

				const isPremium = item.metadata?.type === PreOrderItemType.PREMIUM;
				const isBundle = item.metadata?.type === PreOrderItemType.BUNDLE;
				if (isPremium) {
					unitPrice = 0;
				}

				if (isBundle) {
					// Find matching bundle product and update unit price
					const bundleProduct = productBundles
						.flatMap((bundle) => bundle.products || [])
						.find((product) => product.productId === item.product_id);

					if (bundleProduct) {
						unitPrice = bundleProduct.price ?? 0;
					}
				}

				const preparedItem = prepareLineItemData({
					variant: variant,
					unitPrice,
					isTaxInclusive:
						variant.calculated_price.is_calculated_price_tax_inclusive,
					quantity: item.quantity,
					metadata: item.metadata,
					cartId: cart.id,
				});

				return {
					selector: { id: item.id },
					data: preparedItem,
				};
			}),
		);

		// const isOverideUnitPrice =
		// 	!!cartMetadata?.pickup_option?.is_overide_unit_price;

		// must always override unit price because may be bundle or premium in the cart
		const isOverideUnitPrice = true;

		return new StepResponse({
			items,
			isOverideUnitPrice,
		});
	},
);

export default preparePreOrderLineItemStep;

import type { PriceListCustom } from '@customTypes/price-list-custom';
import type { PriceListDTO } from '@medusajs/framework/types';
import { ContainerRegistrationKeys } from '@medusajs/framework/utils';
import { createStep, StepResponse } from '@medusajs/framework/workflows-sdk';

type StepInput = {
	cartId: string;
	currentFlashSale: PriceListDTO;
};

const validateCartItemsFlashSaleStep = createStep(
	'validate-cart-items-flash-sale',
	async ({ cartId, currentFlashSale }: StepInput, { container }) => {
		if (!currentFlashSale) {
			return new StepResponse({
				is_valid_all: true,
				message: 'No flash sale is currently active',
				code: 'no_flash_sale_active',
				items: [],
			});
		}

		const query = container.resolve(ContainerRegistrationKeys.QUERY);
		const {
			data: [cart],
		} = await query.graph({
			entity: 'cart',
			filters: { id: cartId },
			fields: ['*', 'items.*'],
			pagination: { take: 1, skip: 0 },
		});
		const cartItems = cart.items.map((item) => {
			return {
				quantity: item.quantity,
				variant_id: item.variant_id,
				variant_title: item.title,
				product_id: item.product_id,
				product_title: item.product_title,
			};
		});

		const priceListCustom =
			// @ts-ignore
			currentFlashSale.price_list_custom as PriceListCustom;
		const priceListVariants = priceListCustom?.price_list_variants || [];

		const mappedFlashSaleVariants = priceListVariants.map((variant) => {
			return {
				variant_id: variant.product_variant_id,
				quantity: variant.quantity,
				reserved_quantity: variant.reserved_quantity,
			};
		});

		const result = {
			is_valid_all: true,
			message: '',
			code: '',
			items: [],
		};

		for (const cartItem of cartItems) {
			const flashSaleItem = mappedFlashSaleVariants.find(
				(item) => item.variant_id === cartItem.variant_id,
			);
			if (!flashSaleItem) {
				continue;
			}

			const itemQuantity = cartItem.quantity;
			const reservedQuantity = flashSaleItem.reserved_quantity;
			const availableQuantity = flashSaleItem.quantity - reservedQuantity;

			if (itemQuantity > availableQuantity) {
				result.is_valid_all = false;
				result.message = `Quantity of variant ${cartItem.variant_id} exceeds available quantity`;
				result.code = 'quantity_exceeds_available';
				result.items.push({
					variant_id: cartItem.variant_id,
					is_valid: false,
					cart_quantity: itemQuantity,
					flash_sale_quantity: flashSaleItem.quantity,
					flash_sale_reserved_quantity: reservedQuantity,
					flash_sale_available_quantity:
						availableQuantity > 0 ? availableQuantity : 0,
					variant_title: cartItem.variant_title,
					product_id: cartItem.product_id,
					product_title: cartItem.product_title,
				});
			}
		}

		return new StepResponse({
			...result,
		});
	},
);

export default validateCartItemsFlashSaleStep;

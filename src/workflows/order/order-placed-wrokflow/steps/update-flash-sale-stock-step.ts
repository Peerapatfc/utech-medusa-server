import type {
	Logger,
	OrderDetailDTO,
	PriceListDTO,
} from "@medusajs/framework/types";
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import type { PriceListVariant } from "@customTypes/price-list-custom";
import type PriceListCustomModuleService from "../../../../modules/price-list-custom/service";
import { PRICE_LIST_CUSTOM_MODULE } from "../../../../modules/price-list-custom";
import type { CustomOrderDetailDTO } from "../type";

type UpdateFlashSaleStockInput = {
	currentFlashSale: PriceListDTO;
	orderDetail: OrderDetailDTO | CustomOrderDetailDTO;
	type: "order-placed" | "order-canceled";
};

const updateFlashSaleStockStep = createStep(
	"update-flash-sale-stock-step",
	async (
		{
			currentFlashSale,
			orderDetail,
			type = "order-placed",
		}: UpdateFlashSaleStockInput,
		{ container },
	) => {
		const logger: Logger = container.resolve("logger");
		const priceListCustomModuleService: PriceListCustomModuleService =
			container.resolve(PRICE_LIST_CUSTOM_MODULE);

		const { items } = orderDetail;
		//in the future, maybe we check currentFlashSale from order.created_at if high traffic

		let hasUpdated = false;
		const flashSalePrices = currentFlashSale.prices;
		const flashSaleVariants: PriceListVariant[] =
			// @ts-ignore
			currentFlashSale?.price_list_custom?.price_list_variants || [];

		for await (const orderItem of items) {
			const { variant_id, quantity } = orderItem;
			const variantPrice = flashSalePrices.find(
				// @ts-ignore
				(price) => price.price_set.variant.id === variant_id,
			);
			if (!variantPrice) {
				continue;
			}

			const flashSaleVariant = flashSaleVariants.find(
				(variant) => variant.product_variant_id === variant_id,
			);
			if (!flashSaleVariant) {
				continue;
			}

			const reservedQty = flashSaleVariant.reserved_quantity ?? 0;
			const newReservedQty =
				type === "order-placed"
					? reservedQty + quantity
					: reservedQty - quantity;

			await priceListCustomModuleService.updatePriceListVariants({
				id: flashSaleVariant.id,
				reserved_quantity: newReservedQty,
			});
			hasUpdated = true;
		}

		if (!hasUpdated) {
			logger.info(
				`[update-flash-sale-stock-step]: No flash sale stock updated for order: ${orderDetail.id}`,
			);
			return new StepResponse({
				message: "No flash sale stock updated",
				order_id: orderDetail.id,
			});
		}

		logger.info(
			`[update-flash-sale-stock-step]: Updated flash sale stock for order: ${orderDetail.id}`,
		);

		return new StepResponse({
			message: "Updated flash sale stock",
			order_id: orderDetail.id,
		});
	},
);

export default updateFlashSaleStockStep;

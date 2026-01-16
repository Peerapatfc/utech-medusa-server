import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import type {
	IPricingModuleService,
	PricingTypes,
} from "@medusajs/framework/types";
import type { ValidateProductPrice } from "../type";

export const updateBulkOriginalPricesStep = createStep(
	"update-bulk-original-prices-step",
	async (
		{ product_prices }: { product_prices: ValidateProductPrice[] },
		{ container },
	) => {
		const query = container.resolve(ContainerRegistrationKeys.QUERY);
		const pricingService: IPricingModuleService = container.resolve(
			Modules.PRICING,
		);

		const previousData = [];
		const updatedData = [];
		for await (const productPrice of product_prices) {
			const { price, variant_id } = productPrice;
			const updated = {
				...productPrice,
				is_imported: false,
			};
			updatedData.push(updated);

			if (!productPrice.is_valid || !variant_id) {
				continue;
			}

			if (!price) {
				updated.is_imported = true;
				continue;
			}

			const { data: variantPriceSets } = await query.graph({
				entity: "product_variant_price_set",
				filters: {
					variant_id,
				},
				fields: ["variant_id", "price_set_id"],
				pagination: { take: 2, skip: 0 },
			});

			const priceSetIds = variantPriceSets.map((vps) => vps.price_set_id);

			const dataBeforeUpdate = await pricingService.listPriceSets(
				{
					id: priceSetIds,
				},
				{
					select: ["prices.amount", "prices.currency_code"],
					relations: ["prices"],
				},
			);
			previousData.push(...dataBeforeUpdate);

			const priceNumber = Number.parseFloat(price);
			await pricingService.updatePriceSets(
				{
					id: priceSetIds,
				},
				{
					prices: [{ amount: priceNumber, currency_code: "thb" }],
				},
			);

			updated.is_imported = true;
		}

		return new StepResponse(updatedData, {
			previousData,
		});
	},
	async ({ previousData }, { container }) => {
		const pricingModule = container.resolve<IPricingModuleService>(
			Modules.PRICING,
		);

		if (!previousData || !previousData.length) {
			return;
		}

		for (const priceSet of previousData) {
			await pricingModule.upsertPriceSets(
				priceSet as PricingTypes.UpsertPriceSetDTO[],
			);
		}
	},
);

export default updateBulkOriginalPricesStep;

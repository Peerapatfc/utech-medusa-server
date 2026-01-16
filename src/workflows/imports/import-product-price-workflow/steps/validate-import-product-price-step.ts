import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import type { ProductPrice, ValidateProductPrice } from "../type";
import type { MedusaContainer } from "@medusajs/framework";
import type { IProductModuleService } from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";
import { isMatch } from "date-fns";

const isPositiveNumericString = (str: string) => {
	if (typeof str !== "string") return false;
	const trimmed = str.trim();
	const validNumberPattern = /^\+?(?:\d+(\.\d+)?|\.\d+)$/;
	if (!validNumberPattern.test(trimmed)) return false;
	const num = Number(trimmed);
	return num > 0;
};

export const validateUpdateProducPriceStep = createStep(
	"validate-update-product-price-step",
	async (
		{ product_prices }: { product_prices: ProductPrice[] },
		{ container },
	) => {
		const validateResults: ValidateProductPrice[] = [];

		for await (const productPrice of product_prices) {
			const validateResult = {
				...productPrice,
				errors: [],
				is_valid: true,
				variant_id: null,
				product_id: null,
			};

			const {
				sku,
				price,
				special_price,
				special_price_from_date,
				special_price_to_date,
			} = productPrice;

			if (!sku) {
				validateResult.errors.push("sku is required");
				validateResult.is_valid = false;
			}

			if (sku) {
				const variant = await getVariantBySKU(sku, container);
				if (!variant) {
					validateResult.errors.push(`product with sku ${sku} not found`);
					validateResult.is_valid = false;
				}

				validateResult.variant_id = variant?.id || null;
				validateResult.product_id = variant?.product_id || null;
			}

			if (!price && !special_price) {
				validateResult.errors.push("Either price or special_price is required");
				validateResult.is_valid = false;
			}

			if (price) {
				const isNumber = isPositiveNumericString(price);
				if (!isNumber) {
					validateResult.errors.push(
						"price must be a number and greater than 0",
					);
					validateResult.is_valid = false;
				}
			}

			if (special_price) {
				const isSPNumber = isPositiveNumericString(special_price);
				if (!isSPNumber) {
					validateResult.errors.push(
						"special_price must be a number and greater than 0",
					);
					validateResult.is_valid = false;
				}
			}

			if (price && special_price && validateResult.is_valid) {
				const priceNumber = Number.parseFloat(price);
				const specialPriceNumber = Number.parseFloat(special_price);

				if (specialPriceNumber > priceNumber) {
					validateResult.errors.push("Special_price value higher than price");
					validateResult.is_valid = false;
				}
			}

			if (special_price_from_date) {
				const isValidFormat = isMatch(
					special_price_from_date,
					"M/d/yyyy HH:mm",
				);
				if (!isValidFormat) {
					validateResult.errors.push(
						"special_price_from_date must be in format M/d/yyyy HH:mm",
					);
					validateResult.is_valid = false;
				}
			}

			if (special_price_to_date) {
				const isValidFormat = isMatch(special_price_to_date, "M/d/yyyy HH:mm");
				if (!isValidFormat) {
					validateResult.errors.push(
						"special_price_to_date must be in format M/d/yyyy HH:mm",
					);
					validateResult.is_valid = false;
				}
			}

			validateResults.push(validateResult);
		}

		return new StepResponse(validateResults);
	},
);

const getVariantBySKU = async (sku: string, container: MedusaContainer) => {
	if (!sku) return null;

	const productService: IProductModuleService = container.resolve(
		Modules.PRODUCT,
	);

	return productService
		.listProductVariants(
			{
				sku,
			},
			{
				select: ["id", "sku", "product_id"],
				take: 1,
			},
		)
		.then((res) => res[0]);
};

import { z } from 'zod';
import { PriceListCreateProductVariantSchema } from '../../../../../routes/flash-sale/common/schemas';

export const VariantsSchema = z.record(
	PriceListCreateProductVariantSchema.omit({ flash_sale: true }).extend({
		location_quantity: z.record(
			z.object({
				available_quantity: z.string().or(z.number()).optional(),
				inventory_item_id: z.string(),
			}),
		),
	}),
);

export type VariantsType = z.infer<typeof VariantsSchema>;

export type CurrencyPricesType = z.infer<
	typeof VariantsSchema.valueSchema.shape.currency_prices
>;
export type RegionPricesType = z.infer<
	typeof VariantsSchema.valueSchema.shape.region_prices
>;
export type LocationQuantityType = z.infer<
	typeof VariantsSchema.valueSchema.shape.location_quantity
>;
export const ProductsSchema = z.record(
	z.object({
		variants: VariantsSchema,
	}),
);

export type ProductsType = z.infer<typeof ProductsSchema>;

export const UpdateProductsVariantsSchema = z.object({
	product_ids: z.array(z.object({ id: z.string() })).min(1),
	products: ProductsSchema,
});

export type UpdateProductsVariantsType = z.infer<
	typeof UpdateProductsVariantsSchema
>;

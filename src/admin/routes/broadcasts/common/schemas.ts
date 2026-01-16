import { z } from 'zod';

const BroadCastsCustomerGroupSchema = z.object({
	id: z.string(),
	name: z.string(),
	customers: z.number(),
});

export type BroadCastsCustomerGroup = z.infer<
	typeof BroadCastsCustomerGroupSchema
>;

const BroadCastsCustomerSchema = z.object({
	id: z.string(),
	email: z.string(),
	name: z.string(),
	has_account: z.boolean(),
});

export type BroadCastsCustomer = z.infer<typeof BroadCastsCustomerSchema>;

const BroadCastsCreateCurrencyPriceSchema = z.object({
	amount: z.string().or(z.number()).optional(),
});

export type BroadCastsCreateCurrencyPrice = z.infer<
	typeof BroadCastsCreateCurrencyPriceSchema
>;

const BroadCastsCreateRegionPriceSchema = z.object({
	amount: z.string().or(z.number()).optional(),
});

export type BroadCastsCreateRegionPriceSchema = z.infer<
	typeof BroadCastsCreateRegionPriceSchema
>;

const BroadCastsCreateProductVariantSchema = z.object({
	currency_prices: z.record(BroadCastsCreateCurrencyPriceSchema.optional()),
	region_prices: z.record(BroadCastsCreateRegionPriceSchema.optional()),
	flash_sale: z
		.object({
			quantity: z.string().or(z.number()).optional(),
			available_quantity: z.number().optional(),
		})
		.optional(),
});

export type BroadCastsCreateProductVariantSchema = z.infer<
	typeof BroadCastsCreateProductVariantSchema
>;

const BroadCastsCreateProductVariantsSchema = z.record(
	BroadCastsCreateProductVariantSchema,
);

export type BroadCastsCreateProductVariantsSchema = z.infer<
	typeof BroadCastsCreateProductVariantsSchema
>;

export const BroadCastsCreateProductsSchema = z.record(
	z.object({
		variants: BroadCastsCreateProductVariantsSchema,
	}),
);

export type BroadCastsCreateProductsSchema = z.infer<
	typeof BroadCastsCreateProductsSchema
>;

export const BroadCastsUpdateCurrencyPriceSchema = z.object({
	amount: z.string().or(z.number()).optional(),
	id: z.string().nullish(),
});

export type BroadCastsUpdateCurrencyPrice = z.infer<
	typeof BroadCastsUpdateCurrencyPriceSchema
>;

export const BroadCastsUpdateRegionPriceSchema = z.object({
	amount: z.string().or(z.number()).optional(),
	id: z.string().nullish(),
});

export type BroadCastsUpdateRegionPrice = z.infer<
	typeof BroadCastsUpdateRegionPriceSchema
>;

export const BroadCastsUpdateProductVariantsSchema = z.record(
	z.object({
		currency_prices: z
			.record(BroadCastsUpdateCurrencyPriceSchema.optional())
			.optional(),
		region_prices: z
			.record(BroadCastsUpdateRegionPriceSchema.optional())
			.optional(),
		flash_sale: z
			.object({
				quantity: z.string().or(z.number()).optional(),
				available_quantity: z.number().optional(),
			})
			.optional(),
	}),
);

export type BroadCastsUpdateProductVariantsSchema = z.infer<
	typeof BroadCastsUpdateProductVariantsSchema
>;

export const BroadCastsUpdateProductsSchema = z.record(
	z.object({
		variants: BroadCastsUpdateProductVariantsSchema,
	}),
);

export type BroadCastsUpdateProductsSchema = z.infer<
	typeof BroadCastsUpdateProductsSchema
>;

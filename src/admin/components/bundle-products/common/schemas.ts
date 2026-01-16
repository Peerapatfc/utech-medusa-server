import type { ProgressStatus } from '@medusajs/ui';
import { z } from 'zod';

export const ProductRecordSchema = z.object({
	index: z.number().optional(),
	title: z.string(),
	productId: z.string().min(1, { message: 'Required field' }),
	productTitle: z.string().optional(),
	variantId: z.string().min(1, { message: 'Required field' }),
	variantTitle: z.string().optional(),
	price: z.number().optional(),
});

export const CustomOptionSchema = z.object({
	bundles: z.array(
		z.object({
			title_th: z.string().min(1, { message: 'Required field' }),
			title_en: z.string().min(1, { message: 'Required field' }),
			description_th: z.string(),
			description_en: z.string(),
			selectType: z.string().min(1, { message: 'Required field' }),
			isRequired: z.boolean(),
			products: z.array(ProductRecordSchema),
		}),
	),
});

export enum Tab {
	PRODUCT = 'product',
	VARIANT = 'variant',
}

export const tabOrder = [Tab.PRODUCT, Tab.VARIANT] as const;

export type TabState = Record<Tab, ProgressStatus>;

export const initialTabState: TabState = {
	[Tab.PRODUCT]: 'in-progress',
	[Tab.VARIANT]: 'not-started',
};

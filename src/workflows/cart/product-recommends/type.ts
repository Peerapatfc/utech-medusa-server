import type { ProductCategoryDTO } from '@medusajs/framework/types';

export interface CartItem {
	product_id: string;
	categories: Array<ProductCategoryDTO & { mpath?: string }>;
	created_at: Date;
}

export type SimpleCategory = Pick<ProductCategoryDTO, 'id' | 'name' | 'handle'>;

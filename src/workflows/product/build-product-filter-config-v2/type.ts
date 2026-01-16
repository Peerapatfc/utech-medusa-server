import type { ProductCategoryDTO } from '@medusajs/framework/types';

// Common product interface used across steps
export interface ProductWithVariants {
	id: string;
	metadata?: Record<string, unknown>;
	categories?: { id: string; parent_category_id?: string }[];
	variants?: {
		id: string;
		prices?: { amount: number }[];
		manage_inventory?: boolean;
		inventory_quantity?: number;
	}[];
}

// Attribute filter types
export interface AttributeFilterOption {
	id: string;
	title: string;
	value: string;
	rank: number;
	count: number;
}

export interface AttributeFilterForm {
	title: string;
	attribute: string;
	filter_mode: string;
	options?: AttributeFilterOption[];
	range?: {
		min: number;
		max: number;
	};
}

// Category filter types
export interface CategoryOption {
	id: string;
	title: string;
	value: string;
	rank: number;
	level: number;
	parent_id: string | null;
	children: CategoryOption[];
	count: number;
}

export interface CategoryFilterForm {
	title: string;
	attribute: string;
	filter_mode: string;
	options: CategoryOption[];
}

// Common input interfaces
export interface BaseFilterInput {
	category_id?: string;
	collection_id?: string;
	product_ids?: string[];
	brand_id?: string;
	show_available_only?: boolean;
	allCategories?: ProductCategoryDTO[];
	filters?: Record<string, string | string[]>;
}

// Final filter form type
export interface ProductFilterForm {
	title: string;
	attribute: string;
	filter_mode: string;
	options?: (CategoryOption | AttributeFilterOption)[];
	range?: {
		min: number;
		max: number;
	};
}

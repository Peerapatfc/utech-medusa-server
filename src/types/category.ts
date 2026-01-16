import type { ProductAttribute } from './attribute';

export interface ProductAttributeCategory {
	id?: string;
	name: string;
	description?: string;
	rank?: number;
	status?: boolean;
	metadata?: Record<string, unknown>;
	attributes?: ProductAttribute[];
}

export interface ProductAttributeCategoryUpdate {
	name?: string;
	description?: string;
	rank?: number;
	status?: boolean;
	metadata?: Record<string, unknown>;
}

export interface AttributeIdsRequest {
	attribute_ids: string[];
}

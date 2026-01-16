/**
 * Interface for Product Attribute Category
 */
export interface ProductAttributeCategory {
	id: string;
	name: string;
	description?: string;
	rank?: number;
	status?: boolean;
	metadata?: Record<string, unknown>;
	created_at?: string;
	updated_at?: string;
}

/**
 * Interface for Product Attribute
 */
export interface ProductAttribute {
	id: string;
	title: string;
	description?: string;
	status?: boolean;
	rank?: number;
	created_at?: string;
	updated_at?: string;
	is_default?: boolean;
}

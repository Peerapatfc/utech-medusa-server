export interface InventoryItemLog {
	id: string;
	action: 'updated' | 'reserved' | 'returned';
	from_quantity: number;
	to_quantity: number;
	inventory_item_id: string;
	inventory_level_id: string | null;
	actor_id: string | null;
	metadata: Record<string, unknown> | null;
	created_at: string;

	// computed fields
	no?: number;
	actor_name?: string;
	action_name?: string;
}

export interface PriceChangeLog {
	id: string;
	previous_amount: number;
	new_amount: number;
	actor_id: string | null;
	product_id: string | null;
	variant_id: string | null;
	price_id: string | null;
	metadata: Record<string, unknown> | null;
	created_at: string;

	// computed fields
	change: string;
	price_type: string;
	no?: number;
	actor_name?: string;
}

export interface AdminLog {
	id: string;
	action: string;
	resource_id: string;
	resource_type: string;
	actor_id: string;
	metadata: Record<string, unknown> | null;
	created_at: string | Date;
	updated_at: string | Date;
}

export interface AdminLogResponse extends AdminLog {
	actor: string;
	no: number;
	description?: string;
	sub_description?: string;
	link?: string;
	action_name?: string;
}

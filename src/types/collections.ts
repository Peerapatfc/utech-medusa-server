export interface CollectionMetadataT {
	is_store_visible?: boolean;
	rank?: number;
}

export interface CollectionT {
	id: string;
	title: string;
	handle: string;
	created_at: string;
	updated_at: string;
	metadata?: CollectionMetadataT;
}

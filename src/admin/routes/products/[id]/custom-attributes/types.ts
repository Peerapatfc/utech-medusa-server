export interface ConflictingProduct {
	id: string;
	title: string;
	handle?: string;
}

export interface MetadataValidationResult {
	is_valid: boolean;
	errors: Record<string, string>;
}

export interface ProductMetadataValidationResult {
	is_valid: boolean;
	field_errors: Record<string, string>;
}

export interface MetadataDuplicationResult {
	is_duplicate: boolean;
	metadata_key: string;
	metadata_value: string;
	conflicting_product?: ConflictingProduct & {
		conflicting_value?: string;
	};
}

export interface MetadataValidationConfig {
	key: string;
	value: string;
}

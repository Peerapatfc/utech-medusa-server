export interface ImportHistory {
	id?: string;
	import_type: string;
	imported_file_id: string;
	imported_file_url: string;
	imported_result_file_id: string;
	imported_result_file_url: string;
	original_filename: string;
	status: 'success' | 'failed';
	errors?: string;
	description?: string | null;
	deleted_at?: string | null;
	created_at?: string | null;
	updated_at?: string;
	imported_by?: string | null;

	// computed fields
	imported_by_name?: string;
}

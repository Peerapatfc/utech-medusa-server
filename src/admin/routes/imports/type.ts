export interface ImportValidationReport {
	total_rows: number;
	invalid_rows: number;
	valid_rows: number;
	validation_report_url: string;
}

export interface ImportValidationReportResponse {
	success: boolean;
	import_validation: ImportValidationReport;
}

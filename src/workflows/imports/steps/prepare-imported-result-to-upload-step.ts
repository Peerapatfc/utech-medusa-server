import { StepResponse, createStep } from '@medusajs/framework/workflows-sdk';
import { stringify } from 'csv-stringify/sync';
import type { UploadFilesWorkflowInput } from '@medusajs/medusa/core-flows';

interface ImportedResult {
	[key: string]: unknown;
	errors: string[];
	is_imported: boolean;
	is_valid: boolean;
	variant_id?: string;
}

interface StepInput {
	imported_results: ImportedResult[];
}

export const prepareImportedResultToUploadStep = createStep(
	'prepare-imported-result-top-upload-step',
	async ({ imported_results }: StepInput, { container }) => {
		const normalizeData = [];
		for (const importedResult of imported_results) {
			const errors = importedResult.errors.join(',');
			const status = importedResult.is_imported ? 'success' : 'failed';

			// biome-ignore lint/performance/noDelete: <explanation>
			delete importedResult.is_valid;
			// biome-ignore lint/performance/noDelete: <explanation>
			delete importedResult.is_imported;
			// biome-ignore lint/performance/noDelete: <explanation>
			delete importedResult.variant_id;

			normalizeData.push({
				...importedResult,
				errors,
				status,
			});
		}

		const content = stringify(normalizeData, {
			header: true,
		});

		const filename = 'imported-results.csv';
		const files = {
			files: [
				{
					filename,
					mimeType: 'text/csv',
					content,
					access: 'public',
				},
			],
		} as unknown as UploadFilesWorkflowInput;

		return new StepResponse(files);
	},
);

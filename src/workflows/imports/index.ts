import type { ImportHistory } from '@customTypes/imports';
import {
	createWorkflow,
	transform,
	when,
	WorkflowResponse,
} from '@medusajs/framework/workflows-sdk';
import { uploadFilesWorkflow } from '@medusajs/medusa/core-flows';
import { readCSVFromUrlStep } from '../common';
import { validateFileUrlMimetypeStep } from '../common/steps/validate-file-url-mimetype-step';
import importProductPriceWorkflow from './import-product-price-workflow';
import type { ProductPrice } from './import-product-price-workflow/type';
import { prepareImportedResultToUploadStep } from './steps/prepare-imported-result-to-upload-step';
import { saveImportingHistoryStep } from './steps/save-importing-history-step';

type WorkflowInput = {
	id: string;
	url: string;
	import_type: string;
	original_filename: string;
	description: string;
	imported_by: string;
};

const importWorkflow = createWorkflow(
	'import-workflow',
	(input: WorkflowInput) => {
		// Step 0: Validate file URL mimetype
		validateFileUrlMimetypeStep({
			file_url: input.url,
			allowed_mime_types: ['text/csv'],
		});

		// Step 1: Read CSV from URL
		const csvResponse = readCSVFromUrlStep({
			url: input.url,
		});

		// Step 2: Import product price if the import type is product_price
		const importedRespone = when(input, (input) => {
			return input.import_type === 'product_price';
		})
			.then(() => {
				const stepResult = importProductPriceWorkflow.runAsStep({
					input: {
						product_prices: csvResponse.data as unknown as ProductPrice[],
						original_filename: input.original_filename,
					},
				});
				return stepResult;
			})
			.config({ name: 'import-product-price' });

		// Step 3: Prepare imported result to upload
		const preparedImportedResultToUpload = prepareImportedResultToUploadStep({
			imported_results: importedRespone.imported_results,
		});

		//  Step 4: Upload imported result
		const uploadedImportedResult = uploadFilesWorkflow
			.runAsStep({
				input: preparedImportedResultToUpload,
			})
			.config({ name: 'upload-imported-result' });

		// Step 5: Prepare imported history
		const preparedImportedHistory = transform(
			{
				input,
				uploadedImportedResult,
			},
			({ input, uploadedImportedResult }) => {
				return {
					import_type: input.import_type,
					original_filename: input.original_filename,
					imported_file_id: input.id,
					imported_file_url: input.url,
					imported_result_file_id: uploadedImportedResult[0].id,
					imported_result_file_url: uploadedImportedResult[0].url,
					errors: '',
					description: input.description,
					imported_by: input.imported_by,
				} as ImportHistory;
			},
		);

		// Step 6: Save importing history
		const history = saveImportingHistoryStep({
			data: preparedImportedHistory,
		});

		return new WorkflowResponse(history);
	},
);

export default importWorkflow;

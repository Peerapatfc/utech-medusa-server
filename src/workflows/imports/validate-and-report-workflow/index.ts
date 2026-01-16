import {
	createWorkflow,
	transform,
	when,
	WorkflowResponse,
} from '@medusajs/framework/workflows-sdk';
import { uploadFilesWorkflow } from '@medusajs/medusa/core-flows';
import { readCSVFromUrlStep } from '../../common';
import { validateFileUrlMimetypeStep } from '../../common/steps/validate-file-url-mimetype-step';
import { validateUpdateProducPriceStep } from '../import-product-price-workflow/steps/validate-import-product-price-step';
import type { ProductPrice } from '../import-product-price-workflow/type';
import { normalizeValidationReportStep } from './steps/nomorlize-validation-report-step';

export type WorkflowInput = {
	url: string;
	import_type: string;
};

const validationReportForImportWorkflow = createWorkflow(
	'validate-report-workflow',
	(input: WorkflowInput) => {
		// Step 1: Validate file URL mimetype
		validateFileUrlMimetypeStep({
			file_url: input.url,
			allowed_mime_types: ['text/csv'],
		});

		// Step 2: Read CSV from URL
		const csvResponse = readCSVFromUrlStep({
			url: input.url,
		});

		const validatedUpdatePriceResult = when(input, (input) => {
			return input.import_type === 'product_price';
		}).then(() => {
			// Step 3: Validate the input
			const validatedProductPrices = validateUpdateProducPriceStep({
				product_prices: csvResponse.data as unknown as ProductPrice[],
			});

			return validatedProductPrices;
		});

		// Step 4: Normalize the validation report
		const normalizedReportToUpload = normalizeValidationReportStep({
			validated_update_price_results: validatedUpdatePriceResult,
		});

		// Step 5: Upload the validation report
		const uploadedImportedResult = uploadFilesWorkflow
			.runAsStep({
				input: normalizedReportToUpload.files,
			})
			.config({ name: 'upload-validation-report' });

		const finalResult = transform(
			{
				results: normalizedReportToUpload.results,
				uploadedImportedResult,
			},
			({ results, uploadedImportedResult }) => {
				return {
					total_rows: results.length,
					invalid_rows: results.filter((r) => r.errors).length,
					valid_rows: results.filter((r) => !r.errors).length,
					validation_report_url: uploadedImportedResult[0].url,
				};
			},
		);

		return new WorkflowResponse(finalResult);
	},
);

export default validationReportForImportWorkflow;

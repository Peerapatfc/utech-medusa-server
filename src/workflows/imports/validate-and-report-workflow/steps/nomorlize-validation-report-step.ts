import { createStep, StepResponse } from '@medusajs/framework/workflows-sdk';
import type { UploadFilesWorkflowInput } from '@medusajs/medusa/core-flows';
import { stringify } from 'csv-stringify/sync';
import type { ValidateProductPrice } from '../../import-product-price-workflow/type';

interface StepInput {
	validated_update_price_results: ValidateProductPrice[];
}

export const normalizeValidationReportStep = createStep(
	'normalize-validation-report-step',
	async (input: StepInput, _) => {
		const { validated_update_price_results } = input;
		const results = [];

		if (validated_update_price_results.length > 0) {
			for (const validatedData of validated_update_price_results) {
				const errors = validatedData.errors.join(',');

				// biome-ignore lint/performance/noDelete: <explanation>
				delete validatedData.is_valid;
				// biome-ignore lint/performance/noDelete: <explanation>
				delete validatedData.variant_id;

				results.push({
					...validatedData,
					errors,
				});
			}
		}

		const content = stringify(results, {
			header: true,
		});

		const filename = 'validation-report.csv';
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

		return new StepResponse({
			results,
			files,
		});
	},
);

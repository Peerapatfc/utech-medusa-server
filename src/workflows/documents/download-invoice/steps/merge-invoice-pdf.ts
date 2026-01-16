import { createStep, StepResponse } from '@medusajs/framework/workflows-sdk';
import type { TDocumentDefinitions } from 'pdfmake/interfaces';

const mergeInvoicePdfStep = createStep(
	'merge-invoice-pdf',
	async (input: TDocumentDefinitions) => {
		const docDefinition: TDocumentDefinitions = {
			content: input.content,
			footer: input.footer,
			pageMargins: [40, 320, 40, 95],
			defaultStyle: {
				font: 'NotoSans',
				fontSize: 12,
			},
			styles: {
				header: {
					fontSize: 18,
					bold: true,
					margin: [0, 0, 0, 3],
				},
				productTable: {
					margin: [0, 10, 0, 20],
				},
				totalSummary: {
					margin: [0, 5, 0, 20],
				},
			},
		};

		return new StepResponse({
			docDefinition,
		});
	},
);

export default mergeInvoicePdfStep;

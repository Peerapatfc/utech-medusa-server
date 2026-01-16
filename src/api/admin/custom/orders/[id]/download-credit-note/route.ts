import type { MedusaRequest, MedusaResponse } from '@medusajs/framework';
import downloadCreditNoteWorkflow from '../../../../../../workflows/documents/download-credit-note';
import { pdfPrinter } from '../../../../../../utils/pdf';
import type { TDocumentDefinitions } from 'pdfmake/interfaces';

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
	const orderId = req.params.id;
	const { result } = await downloadCreditNoteWorkflow(req.scope).run({
		input: {
			orderId,
		},
	});

	const { orderDetail } = result;
	const fileNameId = orderDetail?.metadata?.credit_note_no || orderId;

	const printer = pdfPrinter();
	const docDefinition: TDocumentDefinitions = {
		header: (currentPage: number, pageCount: number) => {
			return [
				[
					{
						layout: 'noBorders',
						margin: [40, 10, 40, 0],
						table: {
							widths: ['*', 240],
							body: [
								[
									{},
									{
										text: `Page ${currentPage} of ${pageCount}`,
										alignment: 'right',
										fontSize: 10,
									},
								],
								...result.header,
							],
						},
					},
				],
				{
					canvas: [
						{
							type: 'line',
							x1: 0,
							y1: 0,
							x2: 515,
							y2: 0,
							lineWidth: 1,
						},
					],
					margin: [40, 5, 40, 0],
				},
			];
		},
		...result.docDefinition,
	};

	const doc = printer.createPdfKitDocument(docDefinition);
	const fileName = `credit-note-${fileNameId}.pdf`;
	res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
	res.setHeader('Content-Type', 'application/pdf');
	doc.pipe(res);
	doc.end();
};

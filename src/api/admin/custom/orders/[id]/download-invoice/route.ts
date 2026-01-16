import type { MedusaRequest, MedusaResponse } from '@medusajs/framework';
import downloadInvoiceWorkflow from '../../../../../../workflows/documents/download-invoice';
import { pdfPrinter } from '../../../../../../utils/pdf';
import type { TDocumentDefinitions } from 'pdfmake/interfaces';

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
	const orderId = req.params.id;
	const { result } = await downloadInvoiceWorkflow(req.scope).run({
		input: {
			orderId,
		},
	});

	const { orderDetail } = result;
	const fileNameId = orderDetail?.metadata?.invoice_no || orderId;

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
							x1: 0, // Starting point on x-axis
							y1: 0, // Starting point on y-axis
							x2: 515, // Ending point on x-axis (full width)
							y2: 0, // Ending point on y-axis (keeps the line horizontal)
							lineWidth: 1, // Thickness of the line
						},
					],
					margin: [40, 5, 40, 0],
				},
			];
		},
		...result.docDefinition,
	};

	const doc = printer.createPdfKitDocument(docDefinition);
	const fileName = `invoice-${fileNameId}.pdf`;
	res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
	res.setHeader('Content-Type', 'application/pdf');
	doc.pipe(res);
	doc.end();
};

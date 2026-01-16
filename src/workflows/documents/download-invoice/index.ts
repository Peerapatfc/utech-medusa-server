import {
	createWorkflow,
	WorkflowResponse,
} from '@medusajs/framework/workflows-sdk';
import type { TDocumentDefinitions } from 'pdfmake/interfaces';
import { defaultAdminOrderFields } from '../../../utils/query-configs/order';
import { getOrderDetailWorkflow } from '@medusajs/medusa/core-flows';
import getInvoiceContentStep from './steps/get-invoice-content';
import getInvoiceFooterStep from './steps/get-invoice-footer';
import mergeInvoicePdfStep from './steps/merge-invoice-pdf';
import type { CustomOrderDetailDTO } from './type';
import getInvoiceHeaderStep from './steps/get-invoice-header';
import getOrderDiscountStep from '../common/get-order-discount';

export type DownloadInvoiceWorkflowInput = {
	orderId: string;
};

const downloadInvoiceWorkflow = createWorkflow(
	'Download-Invoice',
	(input: DownloadInvoiceWorkflowInput) => {
		const orderDetail = getOrderDetailWorkflow.runAsStep({
			input: {
				fields: [...defaultAdminOrderFields, 'captured_at'],
				order_id: input.orderId,
			},
		}) as unknown as CustomOrderDetailDTO;

		const { discountTemplate } = getOrderDiscountStep({
			order_id: input.orderId,
		});

		const { header } = getInvoiceHeaderStep({ order: orderDetail });
		const { content } = getInvoiceContentStep({
			order: orderDetail,
			discountTemplate,
		});
		const { footer } = getInvoiceFooterStep({ order: orderDetail });
		const { docDefinition }: { docDefinition: TDocumentDefinitions } =
			mergeInvoicePdfStep({
				content,
				footer,
			});

		return new WorkflowResponse({
			docDefinition,
			header,
			orderDetail,
		});
	},
);

export default downloadInvoiceWorkflow;

import {
	createWorkflow,
	WorkflowResponse,
} from '@medusajs/framework/workflows-sdk';
import type { TDocumentDefinitions } from 'pdfmake/interfaces';
import { defaultAdminOrderFields } from '../../../utils/query-configs/order';
import { getOrderDetailWorkflow } from '@medusajs/medusa/core-flows';
import getCreditNoteContentStep from './steps/get-credit-note-content';
import getCreditNoteFooterStep from './steps/get-credit-note-footer';
import mergeCreditNotePdfStep from './steps/merge-credit-note-pdf';
import type { CustomOrderDetailDTO } from './type';
import getCreditNoteHeaderStep from './steps/get-credit-note-header';
import getOrderDiscountStep from '../common/get-order-discount';

export type DownloadCreditNoteWorkflowInput = {
	orderId: string;
};

const downloadCreditNoteWorkflow = createWorkflow(
	'Download-Credit-Note-Workflow',
	(input: DownloadCreditNoteWorkflowInput) => {
		const orderDetail = getOrderDetailWorkflow.runAsStep({
			input: {
				fields: [...defaultAdminOrderFields, 'captured_at'],
				order_id: input.orderId,
			},
		}) as unknown as CustomOrderDetailDTO;

		const { discountTemplate } = getOrderDiscountStep({
			order_id: input.orderId,
		});

		const { header } = getCreditNoteHeaderStep({ order: orderDetail });
		const { content } = getCreditNoteContentStep({
			order: orderDetail,
			discountTemplate,
		});
		const { footer } = getCreditNoteFooterStep({ order: orderDetail });
		const { docDefinition }: { docDefinition: TDocumentDefinitions } =
			mergeCreditNotePdfStep({
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

export default downloadCreditNoteWorkflow;

import { createStep, StepResponse } from '@medusajs/framework/workflows-sdk';
import type { IOrderModuleService } from '@medusajs/framework/types';
import { Modules } from '@medusajs/framework/utils';

interface UpdateOrderMetadataInput {
	orderId: string;
	generatedCreditNoteNo: string;
}

const updateOrderRefundedMetadataStep = createStep(
	'update-order-refunded-metadata-step',
	async (input: UpdateOrderMetadataInput, { container }) => {
		const { orderId, generatedCreditNoteNo } = input;

		const orderService: IOrderModuleService = container.resolve(Modules.ORDER);

		const order = await orderService.retrieveOrder(orderId);

		const metadataToUpdate = {
			...(order.metadata || {}),
			credit_note_no: generatedCreditNoteNo,
		};
		await orderService.updateOrders([
			{
				id: orderId,
				metadata: {
					...metadataToUpdate,
				},
			},
		]);

		return new StepResponse(metadataToUpdate);
	},
);

export default updateOrderRefundedMetadataStep;

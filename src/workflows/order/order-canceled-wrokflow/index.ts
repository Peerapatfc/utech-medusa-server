import {
	createWorkflow,
	transform,
	WorkflowResponse,
	parallelize,
	when,
} from '@medusajs/framework/workflows-sdk';
import sendEmailStep from './steps/send-email-step';
import { useQueryStep } from '../../common';
import type { CustomOrderDetailDTO } from './type';
import inventoryQuantityLogsStep from '../../common/steps/inventory-quantity-logs.step';
import updateProductSearchMetadataWorkflow from '../../product/update-product-search-metadata';
import getCurrentFlashSaleStep from '../../../workflows/common/steps/get-current-flash-sale-step';
import updateFlashSaleStockStep from '../order-placed-wrokflow/steps/update-flash-sale-stock-step';
import revalidateStoreTagsStep from '../../common/steps/revalidate-store-tags-step';

export type OrderCanceledWorkflowInput = {
	id: string;
};

export const THREE_DAYS = 60 * 60 * 24 * 3;
export const orderCanceledWorkflowId = 'order-canceled-workflow';

const orderCanceledWorkflow = createWorkflow(
	{
		name: orderCanceledWorkflowId,
		store: true,
		idempotent: true,
		retentionTime: THREE_DAYS,
	},
	(input: OrderCanceledWorkflowInput) => {
		const orders = useQueryStep({
			entity: 'order',
			fields: [
				'id',
				'items.*',
				'metadata',
				'email',
				'shipping_address.first_name',
			],
			filters: {
				id: input.id,
			},
		});

		const orderDetail = transform({ orders }, ({ orders }) => {
			return orders.data[0] as CustomOrderDetailDTO;
		});

		const productIds = transform({ orderDetail }, ({ orderDetail }) => {
			return orderDetail.items.map((item) => item.product_id);
		});

		const currentFlashSale = getCurrentFlashSaleStep();
		when(currentFlashSale, (currentFlashSale) => {
			return !!currentFlashSale;
		}).then(() => {
			updateFlashSaleStockStep({
				currentFlashSale,
				orderDetail: orderDetail,
				type: 'order-canceled',
			});
		});

		parallelize(
			inventoryQuantityLogsStep({
				orderDetail,
				action: 'returned',
			}),
			sendEmailStep({
				orderDetail,
			}),
			updateProductSearchMetadataWorkflow.runAsStep({
				input: {
					productId: productIds,
				},
			}),
			revalidateStoreTagsStep({
				tags: ['products', 'custom-products', 'flash-sales'],
			}),
		);

		return new WorkflowResponse({});
	},
);

export default orderCanceledWorkflow;

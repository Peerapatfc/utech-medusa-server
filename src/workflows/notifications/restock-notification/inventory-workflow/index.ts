import {
	WorkflowResponse,
	createWorkflow,
} from '@medusajs/framework/workflows-sdk';
import { createNotificationsInventoryStep } from '../steps/create-notifications-inventory';
import { findCustomersStep } from '../steps/find-customers';
import { getProductInfoStep } from '../steps/get-product-info';
interface NotificationData {
	id: string;
}

const restockNotificationInventoryWorkflow = createWorkflow(
	'restock-notification-inventory',
	(input: { inventoryItemId: string; inventoryItemSku: string }) => {
		const { inventoryItemId, inventoryItemSku } = input;

		const productResult = getProductInfoStep({
			inventoryItem: {
				id: inventoryItemId,
				sku: inventoryItemSku,
			},
		});

		const { customersWithProducts } = findCustomersStep({
			variants: productResult.variants,
		});

		createNotificationsInventoryStep({
			customersWithProducts: customersWithProducts,
		});

		return new WorkflowResponse({
			product_id: productResult.productId,
			customer_id: customersWithProducts[0]?.customer.id,
		});
	},
);

export default restockNotificationInventoryWorkflow;

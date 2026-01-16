import {
	WorkflowResponse,
	createWorkflow,
} from '@medusajs/framework/workflows-sdk';
import { createNotificationsStep } from '../steps/create-notifications';
import { findInventoryAvailableStep } from '../steps/find-available';
import { findCustomersStep } from '../steps/find-customers';
import { findOrderStep } from '../steps/find-order';

// Define the interface expected by createNotificationsStep
interface InventoryLevelData {
	stocked_quantity: number;
	reserved_quantity: number;
}

interface InventoryResultData {
	inventory_items?: Array<{
		inventory?: {
			location_levels?: InventoryLevelData[];
		};
	}>;
}

interface NotificationData {
	id: string;
	[key: string]: unknown;
}

const restockNotificationOrderWorkflow = createWorkflow(
	'restock-notification-order',
	(input: { orderId: string }) => {
		const { orderId } = input;
		const orderResult = findOrderStep({
			orderId: input.orderId,
		});

		const inventoryResult = findInventoryAvailableStep({
			variants: orderResult.variants,
		});

		const { customersWithProducts, customerIds } = findCustomersStep({
			variants: orderResult.variants,
		});

		createNotificationsStep({
			customersWithProducts,
			orderItems: orderResult.orderItems,
			inventoryResult:
				inventoryResult.variantWithInventory as unknown as InventoryResultData[],
		});

		return new WorkflowResponse({
			order_id: orderId,
			customer_id: customerIds,
		});
	},
);

export default restockNotificationOrderWorkflow;

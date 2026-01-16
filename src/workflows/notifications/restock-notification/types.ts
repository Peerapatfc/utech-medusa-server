import type { CustomerDTO } from '@medusajs/framework/types';

export type RestockNotificationInput = {
	orderId?: string;
	inventoryItemId?: string;
	locationId?: string;
	type: 'order' | 'inventory';
};

export type InventoryRestockInput = {
	inventoryItemId: string;
	locationId: string;
};

export type NotificationResult = {
	success: boolean;
	notificationsCreated: number;
	customers: string[];
	message?: string;
	productId?: string;
	productTitle?: string;
	notifications?: unknown[];
};

export type OrderItem = {
	id: string;
	product_id: string;
	product_title: string;
	quantity: number;
	variant_id?: string;
};

export type CustomerWithProduct = {
	customer: CustomerDTO;
	productId: string;
	productTitle: string;
};

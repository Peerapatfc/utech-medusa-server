import type { ProgressStatus } from '@medusajs/ui';
export enum Tab {
	PRODUCT = 'product',
	PRICE = 'price',
}

export type InitialStatus = Record<string, ProgressStatus>;

import type { ProgressStatus } from '@medusajs/ui';

export enum StoreNotificationRecipientType {
	ALL = 'all',
	TARGETING = 'targeting',
	SPECIFIC = 'specific',
}

export enum StoreNotificationStatus {
	DRAFT = 'draft',
	SCHEDULED = 'scheduled',
	SENT = 'sent',
	EXPIRED = 'expired',
	FAILED = 'failed',
}

export type CountStatus = {
	label: string;
	value: string;
	count: number;
};

export enum StoreNotificationCategory {
	ANNOUNCEMENT = 'announcement',
	PROMOTION = 'promotion',
	DISCOUNT_CODE = 'discount-code',
	UPDATE_ORDER = 'update-order',
	BLOG = 'blog',
}

export enum Tab {
	DETAIL = 'detail',
	BOARD_CAST = 'broad_cast',
}

export const tabOrder = [Tab.DETAIL, Tab.BOARD_CAST] as const;

export type TabState = Record<Tab, ProgressStatus>;

export const initialTabState: TabState = {
	[Tab.DETAIL]: 'in-progress',
	[Tab.BOARD_CAST]: 'not-started',
};

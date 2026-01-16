export enum StoreNotificationStatus {
	DRAFT = 'draft',
	SCHEDULED = 'scheduled',
	SENT = 'sent',
	EXPIRED = 'expired',
	FAILED = 'failed',
}

export enum StoreNotificationCategory {
	ANNOUNCEMENT = 'announcement',
	PROMOTION = 'promotion',
	DISCOUNT_CODE = 'discount-code',
	UPDATE_ORDER = 'update-order',
	BLOG = 'blog',
}

export enum StoreNotificationRecipientType {
	ALL = 'all',
	TARGETING = 'targeting',
	SPECIFIC = 'specific',
}

export enum StoreNotificationBroadcastType {
	NOW = 'now',
	SCHEDULED = 'scheduled',
}

export interface StoreNotification {
	id: string;
	subject_line: string;
	description?: string | null;
	category: StoreNotificationCategory;
	image_url?: string | null;
	recipient_type: StoreNotificationRecipientType;
	customer_group_ids?: string[] | null;
	customer_ids?: string[] | null;
	status: StoreNotificationStatus;
	metadata?: Record<string, unknown> | null;
	broadcast_type: StoreNotificationBroadcastType;
	scheduled_at?: Date | null;
	created_at?: Date;
	updated_at?: Date;
	created_by?: string | null;
	updated_by?: string | null;
}

export interface NotificationData {
	id: string;
	data?: {
		subject?: string;
		text?: string;
		category?: string;
		is_read?: boolean;
		product_name?: string;
	};
	created_at: string | Date;
}

export interface FormattedNotification {
	id: string;
	subject: string;
	text: string;
	created_at: string | Date;
	category: string;
	is_read: boolean;
}

export interface NotificationCountByCategory {
	all: number;
	promotion: number;
	announcement: number;
	'update-order': number;
}

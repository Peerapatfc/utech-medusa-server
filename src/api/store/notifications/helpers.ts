import type { MedusaContainer } from '@medusajs/framework/types';
import { ContainerRegistrationKeys } from '@medusajs/framework/utils';
import {
	type FormattedNotification,
	type NotificationCountByCategory,
	type NotificationData,
	StoreNotificationCategory,
} from '../../../types/store-notification';

/**
 * Fetches and calculates the unread counts for all notification categories
 */
export async function fetchUnreadCounts(
	scope: MedusaContainer,
	customerId: string,
): Promise<NotificationCountByCategory> {
	const query = scope.resolve(ContainerRegistrationKeys.QUERY);

	const unreadNotificationsResult = await query.graph({
		entity: 'notification',
		fields: ['id', 'data'],
		filters: {
			channel: 'store-notification',
			to: customerId,
		},
	});

	let unreadNotifications = [];
	if (Array.isArray(unreadNotificationsResult.data)) {
		unreadNotifications = unreadNotificationsResult.data.filter(
			(notification: NotificationData) => {
				const isReadFalse = notification.data?.is_read === false;
				const isReadUndefined = notification.data?.is_read === undefined;
				return isReadFalse || isReadUndefined;
			},
		);
	}

	return calculateCounts(unreadNotifications as NotificationData[]);
}

/**
 * Calculates unread notification counts by category
 */
export function calculateCounts(
	notifications: NotificationData[],
): NotificationCountByCategory {
	const totalNotifications = notifications.length;

	const promotionCount = notifications.filter(
		(notification) =>
			notification.data?.category === StoreNotificationCategory.PROMOTION ||
			notification.data?.category === StoreNotificationCategory.DISCOUNT_CODE,
	).length;

	const announcementCount = notifications.filter(
		(notification) =>
			notification.data?.category === StoreNotificationCategory.ANNOUNCEMENT ||
			notification.data?.category === StoreNotificationCategory.BLOG ||
			notification.data?.category === undefined,
	).length;

	const updateOrderCount = notifications.filter(
		(notification) =>
			notification.data?.category === StoreNotificationCategory.UPDATE_ORDER,
	).length;

	return {
		all: totalNotifications,
		announcement: announcementCount,
		promotion: promotionCount,
		'update-order': updateOrderCount,
	};
}

/**
 * Formats notification data for the response
 */
export function formatNotifications(
	notifications: NotificationData[],
): FormattedNotification[] {
	return notifications.map((notification) => ({
		id: notification.id,
		subject: notification.data?.subject ?? '',
		text: notification.data?.text ?? '',
		created_at: notification.created_at,
		category:
			notification.data?.category ?? StoreNotificationCategory.ANNOUNCEMENT,
		is_read: notification.data?.is_read ?? false,
	}));
}

export interface CategoryFilters {
	$or?: Array<{
		data?: {
			$contains?: { category: string };
		};
		$not?: {
			data: {
				$hasKey: string;
			};
		};
	}>;
	data?: {
		$contains: { category: string };
	};
}

export function createCategoryFilters(categoryParam?: string): CategoryFilters {
	if (!categoryParam) {
		return {};
	}

	switch (categoryParam) {
		case StoreNotificationCategory.ANNOUNCEMENT:
			return {
				$or: [
					{
						data: {
							$contains: {
								category: StoreNotificationCategory.ANNOUNCEMENT,
							},
						},
					},
					{
						data: {
							$contains: {
								category: StoreNotificationCategory.BLOG,
							},
						},
					},
					{
						$not: {
							data: {
								$hasKey: 'category',
							},
						},
					},
				],
			};
		case StoreNotificationCategory.PROMOTION:
			return {
				$or: [
					{
						data: {
							$contains: {
								category: StoreNotificationCategory.PROMOTION,
							},
						},
					},
					{
						data: {
							$contains: {
								category: StoreNotificationCategory.DISCOUNT_CODE,
							},
						},
					},
				],
			};
		case StoreNotificationCategory.UPDATE_ORDER:
			return {
				data: {
					$contains: { category: StoreNotificationCategory.UPDATE_ORDER },
				},
			};
		default:
			return {
				data: {
					$contains: { category: categoryParam },
				},
			};
	}
}

export async function countNotificationByCategory(
	scope: MedusaContainer,
	customerId: string,
): Promise<NotificationCountByCategory> {
	const query = scope.resolve(ContainerRegistrationKeys.QUERY);

	const notificationsResult = await query.graph({
		entity: 'notification',
		fields: ['id', 'data'],
		filters: {
			channel: 'store-notification',
			to: customerId,
		},
	});
	return calculateCounts(notificationsResult.data);
}

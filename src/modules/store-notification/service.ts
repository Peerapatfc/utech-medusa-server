import type {
	INotificationModuleService,
	Logger,
} from '@medusajs/framework/types';
import type { Context } from '@medusajs/framework/types';
import {
	InjectManager,
	InjectTransactionManager,
	MedusaContext,
	MedusaService,
} from '@medusajs/framework/utils';
import type { EntityManager } from '@mikro-orm/knex';
import StoreNotificationModel from './models/store-notification';
import { NotificationSubscriptionModel } from './models/notification-subscription';

class StoreNotificationProviderService extends MedusaService({
	StoreNotificationModel: StoreNotificationModel,
	NotificationSubscriptionModel,
}) {
	private logger: Logger;
	private notificationService: INotificationModuleService;
	constructor({
		logger,
		notification,
	}: { logger: Logger; notification: INotificationModuleService }) {
		//biome-ignore lint/style/noArguments: <explanation>
		super(...arguments);
		this.logger = logger;
		this.notificationService = notification;
	}

	async listAndCountStoreNotifications(
		filters: Record<string, unknown>,
		queryConfig: Record<string, unknown>,
	) {
		return await this.listAndCountStoreNotificationModels(filters, queryConfig);
	}

	@InjectTransactionManager()
	protected async softDeleteNotifications(
		notificationIds: string[],
		@MedusaContext() sharedContext?: Context<EntityManager>,
	) {
		const transactionManager = sharedContext?.transactionManager;
		if (!transactionManager) {
			throw new Error('Transaction manager is not available');
		}

		let deleted = 0;
		for await (const id of notificationIds) {
			if (!id) continue;

			const notification = await this.notificationService
				.retrieveNotification(id)
				.catch(() => null);
			if (!notification) continue;

			await transactionManager.nativeUpdate(
				'notification',
				{ id },
				{
					deleted_at: new Date(),
				},
			);

			deleted++;
		}

		return deleted;
	}

	@InjectManager()
	async bulkDeleteNotification(
		notificationIds: string[],
		@MedusaContext() sharedContext?: Context<EntityManager>,
	) {
		return await this.softDeleteNotifications(notificationIds, sharedContext);
	}

	@InjectTransactionManager()
	protected async updateReadNotification(
		notificationIds: string[],
		@MedusaContext() sharedContext?: Context<EntityManager>,
	) {
		const transactionManager = sharedContext?.transactionManager;
		if (!transactionManager) {
			throw new Error('Transaction manager is not available');
		}

		let updated = 0;
		for await (const id of notificationIds) {
			if (!id) continue;

			const notification = await this.notificationService
				.retrieveNotification(id)
				.catch(() => null);
			if (!notification) continue;

			await transactionManager.nativeUpdate(
				'notification',
				{ id },
				{
					data: {
						...notification.data,
						is_read: true,
					},
				},
			);

			updated++;
		}

		return updated;
	}

	@InjectManager()
	async bulkUpdateReadNotification(
		notificationIds: string[],
		@MedusaContext() sharedContext?: Context<EntityManager>,
	) {
		return await this.updateReadNotification(notificationIds, sharedContext);
	}
}

export default StoreNotificationProviderService;

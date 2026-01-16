import {
	cancelOrderWorkflow,
	getOrdersListWorkflow,
} from '@medusajs/core-flows';
import type {
	IPaymentModuleService,
	MedusaContainer,
	OrderDetailDTO,
} from '@medusajs/framework/types';
import { Modules, OrderStatus } from '@medusajs/framework/utils';
import dayjs from 'dayjs';
import { ADMIN_MODULE } from '../modules/admin';
import type AdminModuleService from '../modules/admin/service';
import { CONFIG_DATA_MODULE } from '../modules/config-data';
import type ConfigDataModuleService from '../modules/config-data/service';
import { ConfigDataPath } from '../types/config-data';
import { defaultAdminOrderListFields } from '../utils/query-configs/order-list';

export default async function handlerCancelOrder(container: MedusaContainer) {
	const logger = container.resolve('logger');

	if (process.env.NODE_ENV === 'development') {
		logger.info('[cron]: Cancel order worker is disabled in development mode');
		return;
	}

	const configDataService: ConfigDataModuleService =
		container.resolve(CONFIG_DATA_MODULE);
	const paymentService: IPaymentModuleService = container.resolve(
		Modules.PAYMENT,
	);
	const adminService: AdminModuleService = container.resolve(ADMIN_MODULE);
	const orderService = container.resolve(Modules.ORDER);
	const isEnabled = await configDataService.getByPath(
		ConfigDataPath.CANCEL_ORDER_GENERAL_ENABLED,
	);
	if (!isEnabled || isEnabled.value === '0') {
		logger.info('[cron]: Cancel order worker is disabled');
		return;
	}

	logger.info('[cron]: Cancel order worker is starting...');

	const paymentProviders = await paymentService.listPaymentProviders();
	const method_list: string[] = [];
	paymentProviders.map((option) => {
		method_list.push(
			`${ConfigDataPath.CANCEL_ORDER_GENERAL_CONDITION}/${option.id}`,
		);
	});
	const paymentConfigProviders =
		await configDataService.getByPaths(method_list);
	const workflow = getOrdersListWorkflow(container);
	const { result } = await workflow.run({
		input: {
			fields: defaultAdminOrderListFields,
			variables: {
				filters: {
					status: OrderStatus.PENDING,
					canceled_at: null,
				},
				skip: 0,
				take: 999,
				order: {
					created_at: 'DESC',
				},
			},
		},
	});
	// biome-ignore lint/complexity/useLiteralKeys: <explanation>
	const orders: OrderDetailDTO[] = result['rows'];
	const items: {
		paymentId: string;
		collectionId: string;
		orderId: string;
		orderNo: string;
	}[] = [];
	for (const order of orders) {
		if (order.fulfillment_status !== 'not_fulfilled') continue;
		for (const collection of order.payment_collections) {
			for (const payment of collection.payments) {
				if (payment.captured_at) continue;
				const path = `${ConfigDataPath.CANCEL_ORDER_GENERAL_CONDITION}/${payment.provider_id}`;
				const times = paymentConfigProviders.filter(
					(provider) => provider.path === path,
				);
				if (times.length > 0) {
					const timeForPayment = Number(times[0].value);
					const orderCreatedAt = order.created_at;
					const expiryPayment = dayjs(orderCreatedAt).add(
						timeForPayment,
						'minutes',
					);
					const isExpired = dayjs().isAfter(expiryPayment);
					if (isExpired) {
						items.push({
							paymentId: payment.id,
							collectionId: collection.id,
							orderId: order.id,
							orderNo: order.metadata?.order_no as string,
						});
					}
				}
			}
		}
	}

	for await (const item of items) {
		try {
			await cancelOrderWorkflow(container).run({
				input: {
					order_id: item.orderId,
				},
			});

			orderService.updateOrders(item.orderId, {
				metadata: {
					canceled_by: 'auto-cancel',
				},
			});

			adminService.createAdminLogs({
				action: 'auto_cancel',
				resource_id: item.orderId,
				resource_type: 'order',
				actor_id: 'system',
				metadata: {
					order_id: item.orderId,
					order_no: item.orderNo,
				},
			});

			logger.info(`[cron]: Order #${item.orderId} was cancelled`);
		} catch (error) {
			logger.error(`Failed to cancel order #${item.orderId}`, error);
		}
	}

	if (items.length > 0) {
		logger.info(`[cron]: ${items.length} orders was cancelled`);
	}

	logger.info('[cron]: Cancel order worker is finished');
}

export const config = {
	name: 'auto-cancel-orders',
	schedule: '* * * * *',
};

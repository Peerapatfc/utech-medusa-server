import type {
	AuthenticatedMedusaRequest,
	MedusaResponse,
} from '@medusajs/framework/http';
import type { AdminOrder, OrderDetailDTO } from '@medusajs/framework/types';
import { OrderStatus } from '@medusajs/framework/utils';
import { getOrdersListWorkflow } from '@medusajs/medusa/core-flows';
import { defaultAdminOrderFields } from '../../../utils/query-configs/order';
import { formatPriceWithDecimal } from '../../../utils/prices';
import type { MedusaContainer } from '@medusajs/framework';
import type SearchLogModuleService from '../../../modules/search-log/service';
import { SEARCH_LOG_MODILE_SERVICE } from '../../../modules/search-log';

export const GET = async (
	req: AuthenticatedMedusaRequest,
	res: MedusaResponse,
) => {
	const dashboard = {
		lifetime_sales_total: 0,
		lifetime_sales: '0.00',
		average_order_value: '0.00',
		last_orders: [],
		best_sellers: [],
		top_search_terms: [],
		last_search_terms: [],
	};

	const workflow = getOrdersListWorkflow(req.scope);
	const { result: orders } = (await workflow.run({
		input: {
			fields: ['id', 'status', 'payment_status', 'fulfillment_status'],
			variables: {
				filters: {
					status: {
						$nin: [OrderStatus.DRAFT, OrderStatus.CANCELED],
					},
				},
				limit: 10000,
			},
		},
	})) as unknown as { result: AdminOrder[] };

	if (!orders || orders.length === 0) {
		return res.json(dashboard);
	}

	const capturedAndShippedOrderIds = orders
		.filter(
			(order) =>
				order.payment_status === 'captured' &&
				['shipped', 'delivered'].includes(order.fulfillment_status),
		)
		.map((order) => order.id);

	if (capturedAndShippedOrderIds.length === 0) {
		return res.json(dashboard);
	}

	const { result: capturedAndShippedOrders } = (await workflow.run({
		input: {
			fields: [...defaultAdminOrderFields],
			variables: {
				filters: {
					id: capturedAndShippedOrderIds,
				},
				limit: 10000,
				order: {
					created_at: 'desc',
				},
			},
		},
	})) as unknown as { result: OrderDetailDTO[] };

	for (const order of capturedAndShippedOrders) {
		// item_total : calculated promotion, not including shipping
		const { item_total } = order;
		dashboard.lifetime_sales_total += item_total as number;
	}

	const averageOrderValue =
		dashboard.lifetime_sales_total / capturedAndShippedOrders.length;
	dashboard.lifetime_sales = formatPriceWithDecimal(
		dashboard.lifetime_sales_total,
	);
	dashboard.average_order_value = formatPriceWithDecimal(averageOrderValue);
	dashboard.last_orders = mappingLastOrders(capturedAndShippedOrders);
	dashboard.best_sellers = mappingBestSellers(capturedAndShippedOrders);

	const { top_search_terms, last_search_terms } = await getSearchTerms(
		req.scope,
	);
	dashboard.top_search_terms = top_search_terms;
	dashboard.last_search_terms = last_search_terms;

	// remove unused property
	dashboard.lifetime_sales_total = undefined;

	res.json({
		dashboard,
	});
};

const mappingLastOrders = (orders: OrderDetailDTO[]) => {
	return orders
		.map((order) => {
			const { items, total } = order;
			const itemQTY = items.reduce((acc, item) => {
				return acc + item.quantity;
			}, 0);

			const customerName = `${order.shipping_address?.first_name || ''} ${order.shipping_address?.last_name || ''}`;

			return {
				id: order.id,
				customer_name: customerName,
				item_quantity: itemQTY,
				total: formatPriceWithDecimal(total as number),
			};
		})
		.slice(0, 5);
};

const mappingBestSellers = (orders: OrderDetailDTO[]) => {
	const bestSellers = [];
	for (const order of orders) {
		const { items } = order;
		for (const item of items) {
			const { quantity, product_id } = item;
			const existingItem = bestSellers.find((i) => i.product_id === product_id);
			if (existingItem) {
				existingItem.quantity += quantity;
			} else {
				bestSellers.push({
					product_id,
					product_title: item.product_title,
					quantity,
				});
			}
		}
	}

	return bestSellers.sort((a, b) => b.quantity - a.quantity).slice(0, 5);
};

const getSearchTerms = async (containter: MedusaContainer) => {
	const searchLogService: SearchLogModuleService = containter.resolve(
		SEARCH_LOG_MODILE_SERVICE,
	);

	const searchLogs = await searchLogService.listSearchLogs(
		{},
		{
			take: 5,
			order: {
				created_at: 'desc',
			},
		},
	);

	const lastSearches = [];
	for await (const searchLog of searchLogs) {
		const topSearch = await searchLogService
			.listTopSearches(
				{
					search: searchLog.search,
				},
				{
					take: 1,
				},
			)
			.then((res) => res[0]);

		lastSearches.push({
			id: searchLog.id,
			search: searchLog.search,
			count: topSearch?.count || 1,
		});
	}

	const topSearches = await searchLogService.listTopSearches(
		{},
		{
			take: 5,
			order: {
				count: 'desc',
			},
		},
	);

	return {
		last_search_terms: lastSearches,
		top_search_terms: topSearches.map((log) => ({
			id: log.id,
			search: log.search,
			count: log.count,
		})),
	};
};

import type {
	AuthenticatedMedusaRequest,
	MedusaNextFunction,
	MedusaResponse,
	MiddlewareRoute,
} from '@medusajs/framework';
import bodyParser from 'body-parser';
import { logAdminRequests } from '../utils/helpers/admin-request-logs';
import { logDeleteCampaign } from '../utils/helpers/campaign-logs';
import { customSearchProduct } from '../utils/helpers/custom-search-products';
import { logUpdateFlashSale } from '../utils/helpers/flash-sale-logs';
import {
	logCreateFulfillment,
	logMarkAsDelivered,
	logMarkAsShipped,
} from '../utils/helpers/fufillment-logs';
import { logBulkUpdateInventoryItem } from '../utils/helpers/incentory-items-bulk-change--logs';
import { logUpdateInventoryItem } from '../utils/helpers/inventory-item-change-logs';
import { logCancelOrder } from '../utils/helpers/order-logs';
import { logCapturePayment } from '../utils/helpers/payment-logs';
import { priceListPricesBatch } from '../utils/helpers/prict-list-prices-batch';
import {
	logCreateProductVariant,
	logDeleteProduct,
	logDeleteProductVariant,
	logUpdateProductVariant,
} from '../utils/helpers/product-logs';
import { logUpdadeProductPricing } from '../utils/helpers/product-pricing-change-logs';
import { logDeletePromotion } from '../utils/helpers/promotion-logs';
import { reStockNotification } from '../utils/helpers/restock-notification';
import { filterNotification } from '../utils/helpers/filter-notifications';

interface AuthenticatedMedusaRequestWithAdditionalData
	extends AuthenticatedMedusaRequest {
	validatedBody: {
		additional_data: Record<string, unknown>;
	};
}

const addAuthContextInToAdditionalData = (
	req: AuthenticatedMedusaRequestWithAdditionalData,
	_res: MedusaResponse,
	next: MedusaNextFunction,
) => {
	if (req.method === 'GET') {
		return next();
	}

	req.validatedBody = {
		...req.validatedBody,
		additional_data: {
			...req.validatedBody.additional_data,
			actor_id: req.auth_context?.actor_id,
		},
	};

	next();
};

export const adminRoutesMiddlewares: MiddlewareRoute[] = [
	{
		method: ['ALL'],
		matcher: '/admin/*',
		middlewares: [bodyParser.json(), logAdminRequests],
	},
	{
		method: ['POST'],
		matcher: '/admin/campaigns',
		middlewares: [addAuthContextInToAdditionalData],
	},
	{
		method: ['POST'],
		matcher: '/admin/campaigns/:id',
		middlewares: [addAuthContextInToAdditionalData],
	},
	{
		method: ['DELETE'],
		matcher: '/admin/campaigns/:id',
		middlewares: [logDeleteCampaign],
	},
	{
		method: ['POST'],
		matcher: '/admin/price-lists/:id',
		middlewares: [logUpdateFlashSale],
	},
	{
		method: ['GET'],
		matcher: '/admin/products',
		middlewares: [customSearchProduct],
	},
	{
		method: ['POST'],
		matcher: '/admin/products',
		middlewares: [addAuthContextInToAdditionalData],
	},
	{
		method: ['GET'],
		matcher: '/admin/products',
		middlewares: [customSearchProduct],
	},
	{
		method: ['POST'],
		matcher: '/admin/products/:id',
		middlewares: [addAuthContextInToAdditionalData],
	},
	{
		method: ['DELETE'],
		matcher: '/admin/products/:id',
		middlewares: [logDeleteProduct],
	},
	{
		method: ['POST'],
		matcher: '/admin/products/:id/variants',
		middlewares: [logCreateProductVariant],
	},
	{
		method: ['POST'],
		matcher: '/admin/products/:id/variants/:variant_id',
		middlewares: [logUpdateProductVariant],
	},
	{
		method: ['DELETE'],
		matcher: '/admin/products/:id/variants/:variant_id',
		middlewares: [logDeleteProductVariant],
	},
	{
		method: ['POST'],
		matcher: '/admin/inventory-items/location-levels/batch',
		middlewares: [logBulkUpdateInventoryItem],
	},
	{
		method: ['POST'],
		matcher: '/admin/inventory-items/:id/location-levels/:location_id',
		middlewares: [logUpdateInventoryItem, reStockNotification],
	},
	{
		method: ['POST'],
		matcher: '/admin/products/:id/variants/batch',
		middlewares: [logUpdadeProductPricing],
	},
	{
		method: ['POST'],
		matcher: '/admin/promotions',
		middlewares: [addAuthContextInToAdditionalData],
	},
	{
		method: ['POST'],
		matcher: '/admin/promotions/:id',
		middlewares: [addAuthContextInToAdditionalData],
	},
	{
		method: ['DELETE'],
		matcher: '/admin/promotions/:id',
		middlewares: [logDeletePromotion],
	},
	{
		method: ['POST'],
		matcher: '/admin/orders/:id/cancel',
		middlewares: [logCancelOrder],
	},
	{
		method: ['POST'],
		matcher: '/admin/orders/:id/fulfillments',
		middlewares: [logCreateFulfillment],
	},
	{
		method: ['POST'],
		matcher: '/admin/orders/:id/fulfillments/:fulfillment_id/shipments',
		middlewares: [logMarkAsShipped],
	},
	{
		method: ['POST'],
		matcher: '/admin/orders/:id/fulfillments/:fulfillment_id/mark-as-delivered',
		middlewares: [logMarkAsDelivered],
	},
	{
		method: ['POST'],
		matcher: '/admin/payments/:id/capture',
		middlewares: [logCapturePayment],
	},
	{
		method: ['POST'],
		matcher: '/admin/price-lists/:id/prices/batch',
		middlewares: [priceListPricesBatch],
	},
	{
		methods: ['GET'],
		matcher: '/admin/notifications',
		middlewares: [filterNotification],
	},
];

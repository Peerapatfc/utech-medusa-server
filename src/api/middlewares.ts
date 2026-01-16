import {
	type MedusaNextFunction,
	type MedusaRequest,
	type MedusaResponse,
	defineMiddlewares,
	errorHandler,
	formatException,
} from '@medusajs/framework/http';
import { MedusaError } from '@medusajs/framework/utils';
import Sentry from '@sentry/node';
import { customAdminOrderRoutesMiddlewares } from '../middlewares/order';
import { revalidateRoutesMiddlewares } from '../middlewares/revalidate';
import { adminBlogMiddlewares } from './admin/blog/middlewares';
import { adminFlashSaleRoutesMiddlewares } from './admin/custom/flash-sales/middlewares';
import { adminPriceListsCustomRoutesMiddlewares } from './admin/custom/price-lists/middlewares';
import { adminProductsVariantsBatchMiddlewares } from './admin/custom/products/variants/batch/middlewares';
import { adminImportRoutesMiddlewares } from './admin/imports/middlewares';
import { adminRoutesMiddlewares } from './admin/middlewares';
import { adminProductAttributeCategoriesMiddlewares } from './admin/product-attribute-categories/middlewares';
import { adminStoreNotificationRoutesMiddlewares } from './admin/store-notifications/middlewares';
import { hooksStrapiRoutesMiddlewares } from './hooks/strapi/middleware';
import { storeCustomOrdertRoutesMiddlewares } from './store/custom/orders/middlewares';
import { storeCustomProductRoutesMiddlewares } from './store/custom/products/middleware';
import { storeMeRoutesMiddlewares } from './store/me/middlewares';
import { storeNotificationRoutesMiddlewares } from './store/notifications/middlewares';
import { storeUploadRoutesMiddlewares } from './store/uploads/middlewares';

const QUERY_RUNNER_RELEASED = 'QueryRunnerAlreadyReleasedError';
const TRANSACTION_STARTED = 'TransactionAlreadyStartedError';
const TRANSACTION_NOT_STARTED = 'TransactionNotStartedError';

export default defineMiddlewares({
	routes: [
		...adminRoutesMiddlewares,
		...storeUploadRoutesMiddlewares,
		...storeCustomProductRoutesMiddlewares,
		...hooksStrapiRoutesMiddlewares,
		...customAdminOrderRoutesMiddlewares,
		...storeMeRoutesMiddlewares,
		...storeNotificationRoutesMiddlewares,
		...revalidateRoutesMiddlewares,
		...adminPriceListsCustomRoutesMiddlewares,
		...adminFlashSaleRoutesMiddlewares,
		...adminImportRoutesMiddlewares,
		...adminStoreNotificationRoutesMiddlewares,
		...adminProductAttributeCategoriesMiddlewares,
		...adminProductsVariantsBatchMiddlewares,
		...storeCustomOrdertRoutesMiddlewares,
		...adminBlogMiddlewares,
	],
	errorHandler: (
		error: MedusaError | any,
		req: MedusaRequest,
		res: MedusaResponse,
		next: MedusaNextFunction,
	) => {
		const err = formatException(error);
		const errorType = err.type || err.name;

		switch (errorType) {
			case QUERY_RUNNER_RELEASED:
			case TRANSACTION_STARTED:
			case TRANSACTION_NOT_STARTED:
			case MedusaError.Types.CONFLICT:
			case MedusaError.Types.UNAUTHORIZED:
			case MedusaError.Types.PAYMENT_AUTHORIZATION_ERROR:
			case MedusaError.Types.DUPLICATE_ERROR:
			case MedusaError.Types.NOT_ALLOWED:
			case MedusaError.Types.INVALID_DATA:
			case MedusaError.Types.NOT_FOUND:
				// case MedusaError.Types.UNEXPECTED_STATE:
				// case MedusaError.Types.INVALID_ARGUMENT:
				break;
			default: {
				Sentry.captureException(err);
				break;
			}
		}

		return errorHandler()(error, req, res, next);
	},
});

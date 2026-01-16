import {
	WorkflowResponse,
	createWorkflow,
} from '@medusajs/framework/workflows-sdk';
import { fetchAllOrdersStep } from './steps/fetch-all-orders';
import { fetchAllRegisteredCustomersStep } from './steps/fetch-all-registered-customers';
import { fetchInitialProductDataStep } from './steps/fetch-initial-product-data';
import { getAccumulatedOrderValueYTDStep } from './steps/get-accumulated-order-value-ytd';
import { getCampaignBannerClicksStep } from './steps/get-campaign-banner-clicks';
import { getMostPurchasedProductsStep } from './steps/get-most-purchased-products';
import { getMostSearchedKeywordsStep } from './steps/get-most-searched-keywords';
import { getMostViewedProductsStep } from './steps/get-most-viewed-products';
import { getMostWishlistProductsStep } from './steps/get-most-wishlisted-products';
import { getOrderCountsByStatusYTDStep } from './steps/get-order-counts-by-status-ytd';
import { getRecentPurchasersStep } from './steps/get-recent-purchasers';
import { getRecentlyVisitedUsersStep } from './steps/get-recently-visited-users';
import { getRegisteredUsersCountStep } from './steps/get-registered-users-count';
import { getUserRegistrationTrendStep } from './steps/get-user-registration-trend';

const SHOW_LIMIT = 5;
const DAYS_AGO = 7;

export const getDashboardDataInsightsWorkflow = createWorkflow(
	'get-dashboard-data-insights-workflow',
	(input: Record<string, unknown>) => {
		// Fetch initial data
		const initialProductData = fetchInitialProductDataStep({});
		const allOrders = fetchAllOrdersStep({});
		const allRegisteredCustomers = fetchAllRegisteredCustomersStep({});

		// Get insights
		const mostViewed = getMostViewedProductsStep({
			products: initialProductData,
			limit: SHOW_LIMIT,
		});
		const mostWishlist = getMostWishlistProductsStep({
			products: initialProductData,
			limit: SHOW_LIMIT,
			mostViewedProductIds: mostViewed,
		});
		const mostSearchedByKeywords = getMostSearchedKeywordsStep({
			limit: SHOW_LIMIT,
		});
		const mostPurchasedProducts = getMostPurchasedProductsStep({
			products: initialProductData,
			allOrders: allOrders,
			limit: SHOW_LIMIT,
		});

		// Users
		const registeredUsersCountTotal = getRegisteredUsersCountStep({
			customers: allRegisteredCustomers,
		});
		const recentlyVisitedUsers = getRecentlyVisitedUsersStep({
			customers: allRegisteredCustomers,
			limit: SHOW_LIMIT,
		});
		const recentPurchasers = getRecentPurchasersStep({
			allOrders: allOrders,
			days_ago: DAYS_AGO,
		});
		const userRegistrationTrend = getUserRegistrationTrendStep({
			customers: allRegisteredCustomers,
			days_ago: DAYS_AGO,
		});

		// Campaign Banner
		const campaignBannerClicks = getCampaignBannerClicksStep({
			limit: SHOW_LIMIT,
		});

		// Orders
		const accumulatedOrderValueYTD = getAccumulatedOrderValueYTDStep({
			allOrders: allOrders,
		});
		const orderCountsByStatusYTD = getOrderCountsByStatusYTDStep({
			allOrders: allOrders,
		});

		// The workflow returns a structured response containing all gathered insights.
		return new WorkflowResponse({
			success: true,
			data: {
				products: {
					most_viewed: mostViewed,
					most_wishlist: mostWishlist,
					most_searched: mostSearchedByKeywords,
					most_purchased: mostPurchasedProducts,
				},
				users: {
					registered_customer: registeredUsersCountTotal,
					recently_visited: recentlyVisitedUsers,
					recent_purchasers: recentPurchasers,
					registration_trend: userRegistrationTrend,
				},
				campaign_banner: campaignBannerClicks,
				orders: {
					accumulated_value: accumulatedOrderValueYTD,
					counts_by_status: orderCountsByStatusYTD,
				},
			},
		});
	},
);

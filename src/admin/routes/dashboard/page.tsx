import { defineRouteConfig } from "@medusajs/admin-sdk";
import { BuildingsMini } from "@medusajs/icons";
import { Container } from "@medusajs/ui";
import { useDashboardDataInSight } from "../../hooks/api/dashboards";
import { CampaignBannerChart } from "./components/chart/campaign-banner";
import { MostPurchasedChart } from "./components/chart/most-purchased";
import { MostSearchedChart } from "./components/chart/most-searched";
import { OrderStatusChart } from "./components/chart/order-status";
import PaidUsers from "./components/chart/paid-users";
import ProductViewsChart from "./components/chart/product-view-wishlist";
import { UserRegisterChart } from "./components/chart/user-register";
import { RecentlyVisitor } from "./components/table/recently-visitor";
import UserTable from "./components/table/user";

const DashboardPage = () => {
	const { dashboard, isLoading } = useDashboardDataInSight();

	const mostViewed = dashboard?.products?.most_viewed ?? [];
	const mostWishlist = dashboard?.products?.most_wishlist ?? [];
	const mostPurchased = dashboard?.products?.most_purchased ?? [];
	const mostSearched = dashboard?.products?.most_searched ?? [];
	const userRegisterTrend = dashboard?.users?.registration_trend ?? [];
	const campaignBanner = dashboard?.campaign_banner ?? [];
	const orders = dashboard?.orders;

	return (
		<Container className="px-8 pt-[30px] pb-[60px]">
			<div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
				<ProductViewsChart
					mostViewed={mostViewed}
					mostWishlist={mostWishlist}
					isLoading={isLoading}
				/>
				<MostPurchasedChart mostPurchased={mostPurchased} />
				<MostSearchedChart mostSearched={mostSearched} />
				<UserRegisterChart userRegisterTrend={userRegisterTrend} />
				<PaidUsers dashboard={dashboard} />
				<UserTable dashboard={dashboard} />
				<RecentlyVisitor dashboard={dashboard} />
				<CampaignBannerChart campaignBanner={campaignBanner} />
				<OrderStatusChart orders={orders} />
			</div>
		</Container>
	);
};

export const config = defineRouteConfig({
	label: "Dashboard",
	icon: BuildingsMini,
});

export default DashboardPage;

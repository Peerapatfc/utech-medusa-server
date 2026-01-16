export interface LastOrder {
	id: string;
	customer_name: string;
	item_quantity: number;
	total: string;
}

export interface BestSeller {
	product_id: string;
	product_title: string;
	quantity: number;
}

export interface SearchTerm {
	id: string;
	search: string;
	count: number;
}

export type Dashboard = {
	dashboard: {
		lifetime_sales: string;
		average_order_value: string;
		last_orders: LastOrder[];
		best_sellers: BestSeller[];
		top_search_terms: SearchTerm[];
		last_search_terms: SearchTerm[];
	};
};

export interface CampaignBanner {
	id: string;
	name: string;
	type: string;
	count: number;
}

export interface Orders {
	accumulated_value: number;
	counts_by_status: {
		counts: {
			completed: number;
			pending: number;
			cancelled: number;
		};
	};
}

export interface MostPurchased {
	product_id: string;
	product_title: string;
	count: number;
}

export interface MostSearched {
	keyword: string;
	count: number;
}

export interface MostViewed extends MostPurchased {}

export interface MostWishlist {
	product_id: string;
	name: string;
	count: number;
}

export interface Products {
	most_purchased: MostPurchased[];
	most_searched: MostSearched[];
	most_viewed: MostViewed[];
	most_wishlist: MostWishlist[];
}

export interface UserRecentlyVisited {
	user_id: string;
	name: string;
	last_visit: string;
}

export interface UserRecentPurchaser {
	date: string;
	count: number;
}

export interface UserRegistrationTrend extends UserRecentPurchaser {}
export interface Users {
	registered_customer: number;
	recently_visited: UserRecentlyVisited[];
	recent_purchasers: UserRecentPurchaser[];
	registration_trend: UserRegistrationTrend[];
}

export interface DashboardDataInsight {
	campaign_banner: CampaignBanner[];
	orders: Orders;
	products: Products;
	users: Users;
}

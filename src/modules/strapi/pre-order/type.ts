export interface FileStrapi {
	name: string;
	url: string;
	width: number;
	height: number;
	ext: string;
	mime: string;
	size: number;
}

export interface PreOrderStrapi {
	id: number;
	name: string;
	email_footer_images: {
		data: StrapiResponse<FileStrapi>[];
	};
}

export interface StrapiResponse<T> {
	id: number;
	attributes: T;
}

export interface PickupShippingTermStrapi {
	name: string;
	pickup_slug: string;
	terms: string;
	sub_terms: string;
	terms_type: string;
	medusa_pre_orer_campaigne_id: string;
	locale: string;
	localizations: {
		data: PickupShippingTermStrapiData[];
	};
}

export interface PickupShippingTermStrapiData {
	id: number;
	attributes: PickupShippingTermStrapi;
}

export interface PickupShippingTermStrapiList {
	data: PickupShippingTermStrapiData[];
	meta: {
		pagination: {
			page: number;
			pageSize: number;
			pageCount: number;
			total: number;
		};
	};
}

export interface UTechMap {
	map_url: {
		data: {
			id: string;
			attributes: {
				url: string;
			};
		};
	};
}

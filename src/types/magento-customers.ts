export interface MagentoAddress {
	id: number;
	customer_id: number;
	region: {
		region_code: string;
		region: string;
		region_id: number;
	};
	region_id: number;
	country_id: 'TH' | 'EN';
	street: string[];
	company: string;
	telephone: string;
	postcode: string;
	city: string;
	firstname: string;
	lastname: string;
	default_shipping: boolean;
	default_billing: boolean;
	custom_attributes: {
		attribute_code: string;
		value: string;
	}[];
}

export interface TaxInvoiceAddress {
	entity_id: number;
	parent_id: number | null;
	firstname: string;
	lastname: string;
	telephone: string;
	street: string;
	postcode: string;
	region: string;
	region_id: number | null;
	city: string;
	city_id: number | null;
	subdistrict: string;
	subdistrict_id: number | null;
	country_id: string;
	taxpayer_type: string;
	taxpayer_identification_number: string;
	company_name: string | null;
	branch_name: string | null;
	is_active: boolean;
	branch_number: string | null;
	is_default: boolean;
}

export interface MagentoCustomer {
	id: number;
	group_id: number;
	default_billing: string;
	default_shipping: string;
	created_at: string;
	updated_at: string;
	created_in: 'TH' | 'EN';
	email: string;
	firstname: string;
	lastname: string;
	store_id: number;
	website_id: number;
	addresses: MagentoAddress[];
	disable_auto_group_change: number;
	extension_attributes: {
		is_subscribed: boolean;
	};
}

export interface CustomerGroups {
	id: number;
	code: string;
	tax_class_id: number;
	tax_class_name: string;
}

export interface SubDistricts {
	id: number;
	name_th: string;
	name_en: string;
	city_id: number;
	postal_code: string;
	created_at: Date;
	updated_at: Date;
	deleted_at: Date;
}

import type { HttpTypes } from '@medusajs/framework/types';

export enum AddressType {
	Shipping = 'shipping',
	Billing = 'billing',
	TaxInvoice = 'tax_invoice',
}

export enum TaxInvoiceType {
	Personal = 'personal',
	Juristic = 'juristic',
}

export interface CustomStoreCustomerAddress
	extends HttpTypes.AdminOrderAddress {
	metadata: {
		city_id: number;
		sub_district: string;
		sub_district_id: number;
		province_id: number;
		address_type: AddressType | string;
		residence_type: string;
		is_default_tax_invoice: boolean;
		tax_invoice_type: TaxInvoiceType | string;
		juristic_name: string;
		juristic_no: string;
		branch_name: string;
		email: string;
	};
}

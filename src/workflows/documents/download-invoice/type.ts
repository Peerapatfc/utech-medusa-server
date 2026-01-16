import type { PickupOption } from '@customTypes/pre-order';
import type { OrderDetailDTO } from '@medusajs/framework/types';

export interface CustomOrderDetailDTO extends OrderDetailDTO {
	captured_at: string;
	metadata: {
		order_no: string;
		invoice_no: string;
		tax_invoice_address_id: string;

		is_pre_order: boolean;
		pickup_option: PickupOption;
	};
}

export interface GetInvoiceContentInput {
	order: CustomOrderDetailDTO;
	discountTemplate?: string;
}

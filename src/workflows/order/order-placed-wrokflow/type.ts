import type { OrderDetailDTO } from '@medusajs/framework/types';

export interface CustomOrderDetailDTO extends OrderDetailDTO {
	metadata: {
		tax_invoice_address_id: string;
		is_pre_order: boolean;
		pre_order: {
			code: string;
			code_image_url: string;
			id_card_no: string;
			pre_order_template_id: string;
		};
		pickup_option: {
			slug: string;
		};
	};
}

export interface SendEmailInput {
	orderDetail: CustomOrderDetailDTO;
	paymentExpiration: string;
	orderNo: string;
}

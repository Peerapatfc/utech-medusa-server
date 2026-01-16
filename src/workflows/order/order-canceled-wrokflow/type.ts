import type { OrderDetailDTO } from '@medusajs/framework/types';

export interface CustomOrderDetailDTO extends OrderDetailDTO {
	metadata: {
		order_no: string;
	};
}

export interface SendEmailInput {
	orderDetail: CustomOrderDetailDTO;
}

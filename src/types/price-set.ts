import type { PriceSetDTO } from '@medusajs/framework/types';

export interface PriceSetCustomDTO extends PriceSetDTO {
	price_set_custom: {
		qty: number;
	};
	variant_price_set: {
		variant_id: string;
		price_set_id: string;
		id: string;
	};
}

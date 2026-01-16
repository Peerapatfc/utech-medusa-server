export interface CreatePreOrderTemplateDTO {
	name_th: string;
	name_en: string;
	shipping_start_date: Date | null;
	pickup_start_date: Date | null;
	upfront_price: number;
}

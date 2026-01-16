import { ProductDTO } from '@medusajs/framework/types';

export interface Brand {
	id: string;
	handle: string;
	title: string;
	thumbnail: string;
}

export interface MappedCategory {
	id: string;
	handle: string;
	title: string;
	icon: string | null;
	thumbnail: string | null;
	brands: Brand[];
	category_children: MappedCategory[];
	products: ProductDTO[];
}

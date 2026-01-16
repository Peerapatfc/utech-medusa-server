import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import type ProductAttributeService from '../../../modules/product-attributes/service';
import type {
	ProductAttribute,
	ProductAttributeType,
} from '../../../types/attribute';
import type StorefrontModuleService from '../../../modules/storefront/service';
import { STOREFRONT_MODULE } from '../../../modules/storefront';

export async function GET(
	req: MedusaRequest,
	res: MedusaResponse,
): Promise<void> {
	const productAttributeService: ProductAttributeService = req.scope.resolve(
		'productAttributeModuleService',
	);

	const queryFields = req.query as Partial<ProductAttribute>;

	try {
		const attributes =
			await productAttributeService.listAllAttributesWithOptions(queryFields);
		res.json({ attributes });
	} catch (error) {
		console.error('Error fetching attributes:', error);
		res.status(500).json({ error: 'Internal server error' });
	}
}

export async function POST(
	req: MedusaRequest,
	res: MedusaResponse,
): Promise<void> {
	try {
		const {
			title,
			code,
			description,
			type,
			is_filterable,
			is_required,
			is_unique,
			status,
			rank,
			use_in_product_variant,
		} = req.body as Omit<ProductAttribute, 'type'> & { type: string };

		const productAttributeService: ProductAttributeService = req.scope.resolve(
			'productAttributeModuleService',
		);

		const newAttribute = await productAttributeService.createAttribute({
			title,
			code,
			description,
			type: type as ProductAttributeType,
			is_filterable,
			is_required,
			is_unique,
			status,
			metadata: {},
			rank,
			use_in_product_variant,
		});

		const storefrontService: StorefrontModuleService =
			req.scope.resolve(STOREFRONT_MODULE);
		storefrontService.revalidateTags(['product-attributes']);

		res.status(201).json({ attribute: newAttribute });
	} catch (error) {
		console.error('Error creating attribute:', error);
		res.status(500).json({ error: 'Internal server error' });
	}
}

export async function PUT(
	req: MedusaRequest,
	res: MedusaResponse,
): Promise<void> {
	try {
		const attributes = req.body as Partial<
			{
				id: string;
				rank: number;
			}[]
		>;

		const productAttributeService: ProductAttributeService = req.scope.resolve(
			'productAttributeModuleService',
		);

		const newAttributes =
			await productAttributeService.updateProductAttributes(attributes);

		const storefrontService: StorefrontModuleService =
			req.scope.resolve(STOREFRONT_MODULE);
		storefrontService.revalidateTags(['product-attributes']);

		res.status(201).json({ attributes: newAttributes });
	} catch (error) {
		console.error('Error creating attribute:', error);
		res.status(500).json({ error: 'Internal server error' });
	}
}

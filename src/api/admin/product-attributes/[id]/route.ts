import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import type ProductAttributeService from '../../../../modules/product-attributes/service';
import type { ProductAttribute } from '../../../../types/attribute';
import type StorefrontModuleService from '../../../../modules/storefront/service';
import { STOREFRONT_MODULE } from '../../../../modules/storefront';

export async function GET(
	req: MedusaRequest,
	res: MedusaResponse,
): Promise<void> {
	const productAttributeService: ProductAttributeService = req.scope.resolve(
		'productAttributeModuleService',
	);

	const { id } = req.params;
	try {
		const attributes = await productAttributeService.getAttributeById(id);
		res.json({ attributes });
	} catch (error) {
		console.error('Error fetching attributes:', error);
		res.status(500).json({ error: 'Internal server error' });
	}
}

export async function PUT(
	req: MedusaRequest,
	res: MedusaResponse,
): Promise<void> {
	const productAttributeService: ProductAttributeService = req.scope.resolve(
		'productAttributeModuleService',
	);
	const storefrontService: StorefrontModuleService =
		req.scope.resolve(STOREFRONT_MODULE);

	const { id } = req.params;
	const updateData = req.body;

	try {
		const updatedAttribute =
			await productAttributeService.updateProductAttributes({
				id,
				// biome-ignore lint/suspicious/noExplicitAny: <explanation>
				...(updateData as any),
			});

		storefrontService.revalidateTags(['product-attributes']);
		res.json({ attribute: updatedAttribute });
	} catch (error) {
		console.error('Error updating attribute:', error);
		res.status(500).json({ error: 'Internal server error' });
	}
}

export async function DELETE(
	req: MedusaRequest,
	res: MedusaResponse,
): Promise<void> {
	const { id } = req.params;
	const productAttributeService: ProductAttributeService = req.scope.resolve(
		'productAttributeModuleService',
	);
	const storefrontService: StorefrontModuleService =
		req.scope.resolve(STOREFRONT_MODULE);

	try {
		await productAttributeService.deleteAttributeById(id);

		storefrontService.revalidateTags(['product-attributes']);
		res.status(204).send();
	} catch (error) {
		console.error('Error deleting attribute:', error);
		res.status(500).json({ error: 'Internal server error' });
	}
}

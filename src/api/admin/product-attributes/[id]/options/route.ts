import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import type ProductAttributeService from '../../../../../modules/product-attributes/service';
import type { ProductAttribute } from '../../../../../types/attribute';
import type StorefrontModuleService from '../../../../../modules/storefront/service';
import { STOREFRONT_MODULE } from '../../../../../modules/storefront';

export async function GET(
	req: MedusaRequest,
	res: MedusaResponse,
): Promise<void> {
	const productAttributeService: ProductAttributeService = req.scope.resolve(
		'productAttributeModuleService',
	);

	const { id } = req.params;
	try {
		const options = await productAttributeService.listAttributeOptions(id);
		res.json({ options });
	} catch (error) {
		console.error('Error fetching attribute options:', error);
		res.status(500).json({ error: 'Failed to fetch attribute options' });
	}
}

// Function to handle POST requests
export async function POST(req: MedusaRequest, res: MedusaResponse) {
	const productAttributeService: ProductAttributeService = req.scope.resolve(
		'productAttributeModuleService',
	);
	const storefrontService: StorefrontModuleService =
		req.scope.resolve(STOREFRONT_MODULE);

	const { id } = req.params;
	const { options = [] }: Partial<ProductAttribute> = req.body;

	try {
		const productAttribute = await productAttributeService
			.getAttributeById(id)
			.then((attr) => attr[0]);
		if (!productAttribute) {
			res.status(404).json({ error: 'Attribute not found' });
			return;
		}

		const optionIdsToKeep = new Set(
			options.map((option) => option.id).filter(Boolean),
		);
		const processedOptions = options.map((option) => ({
			...option,
			attribute_id: id,
			metadata: option.metadata || {},
			id:
				option.id === 'undefined' || option.id?.indexOf('temp_') !== -1
					? undefined
					: option.id,
		}));

		const optionsToCreate = processedOptions.filter(
			(option) => option.id === undefined,
		);
		const optionsToUpdate = processedOptions.filter(
			(option) => option.id !== undefined,
		);

		const existingOptions =
			await productAttributeService.listAttributeOptions(id);
		await Promise.all(
			existingOptions.map((existingOption) => {
				if (!optionIdsToKeep.has(existingOption.id)) {
					return productAttributeService.deleteProductAttributeOption(
						id,
						existingOption.id,
					);
				}
			}),
		);

		const createdOptions =
			await productAttributeService.createProductAttributeOptions(
				// biome-ignore lint/suspicious/noExplicitAny: <explanation>
				optionsToCreate as any,
			);
		const updatedOptions =
			await productAttributeService.updateProductAttributeOptions(
				// biome-ignore lint/suspicious/noExplicitAny: <explanation>
				optionsToUpdate as any,
			);

		storefrontService.revalidateTags(['product-attributes-options']);

		const optionsToReturn = [];
		if (Array.isArray(createdOptions)) {
			optionsToReturn.push(...createdOptions);
		} else {
			optionsToReturn.push(createdOptions);
		}

		if (Array.isArray(updatedOptions)) {
			optionsToReturn.push(...updatedOptions);
		} else {
			optionsToReturn.push(updatedOptions);
		}

		res.json({
			attribute: {
				id: id,
				options: optionsToReturn,
			},
		});
	} catch (error) {
		console.error('Error updating attribute options:', error);
		res.status(500).json({ error: 'Failed to update attribute options' });
	}
}

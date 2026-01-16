import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import type { IProductModuleService } from '@medusajs/types';
import { Modules } from '@medusajs/utils';
import type ProductAttributeService from '../../../../../../modules/product-attributes/service';
import { PRODUCT_ATTRIBUTE_MODULE } from '../../../../../../modules/product-attributes';

export async function GET(
	req: MedusaRequest,
	res: MedusaResponse,
): Promise<void> {
	const logger = req.scope.resolve('logger');
	const id = req.params.id;

	const productModuleService = req.scope.resolve<IProductModuleService>(
		Modules.PRODUCT,
	);

	try {
		const product = await productModuleService.retrieveProduct(id);
		if (!product) {
			res.status(404).json({ message: 'Product not found' });
			return;
		}

		const productAttributeService: ProductAttributeService = req.scope.resolve(
			PRODUCT_ATTRIBUTE_MODULE,
		);

		const atrributes = await productAttributeService.listProductAttributes(
			{
				status: true,
			},
			{
				relations: ['options'],
			},
		);

		const atrributeCodes = atrributes.map((attr) => attr.code);
		const custom_attributes = [];

		for (const attrKey in product.metadata) {
			if (!atrributeCodes.includes(attrKey) || product.metadata[attrKey] === '')
				continue;

			const productAttribute = atrributes.find(
				(productAttribute) => productAttribute.code === attrKey,
			);

			const option = productAttribute?.options?.find(
				(option) => option.value === product.metadata[attrKey],
			);

			const attribute = {
				...productAttribute,
				options: undefined,
				value: option ? option.title : product.metadata[attrKey],
				option,
			};
			custom_attributes.push(attribute);
		}

		res.json({
			custom_attributes,
		});
	} catch (error) {
		logger.error(error);
		res.status(500).json({
			message: 'An error occurred while fetching product attribute options',
		});
	}
}

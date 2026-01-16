import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import type ProductAttributeService from '../../../modules/product-attributes/service';
import type { ProductAttribute } from '../../../types/attribute';
import { MedusaError } from '@medusajs/framework/utils';

interface AttributeQuery extends Partial<ProductAttribute> {
	limit?: number;
	offset?: number;
}

export async function GET(
	req: MedusaRequest,
	res: MedusaResponse,
): Promise<void> {
	const productAttributeService: ProductAttributeService = req.scope.resolve(
		'productAttributeModuleService',
	);

	const queryFields = { ...req.query, status: true } as Partial<AttributeQuery>;
	const { limit, offset, ...filteredQueryFields } = queryFields;

	try {
		const attributes =
			await productAttributeService.listAllAttributesWithOptions(
				filteredQueryFields,
				limit,
				offset,
			);

		res.json({ attributes });
	} catch (error) {
		throw new MedusaError(
			MedusaError.Types.UNEXPECTED_STATE,
			error?.message || 'An unexpected error occurred',
		);
	}
}

import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { PRODUCT_ATTRIBUTE_MODULE } from '../../../../modules/product-attributes';
import type ProductAttributeService from '../../../../modules/product-attributes/service';
import type {
	ProductAttributeCategory,
	ProductAttributeCategoryUpdate,
} from '../../../../types/category';

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
	const productAttributeService: ProductAttributeService = req.scope.resolve(
		PRODUCT_ATTRIBUTE_MODULE,
	);

	try {
		const { id } = req.params;
		const category =
			await productAttributeService.retrieveProductAttributeCategory(id);

		if (!category) {
			return res.status(404).json({ message: 'Category not found' });
		}

		return res.json({ category });
	} catch (error) {
		return res.status(400).json({ message: error.message });
	}
};

export const PUT = async (req: MedusaRequest, res: MedusaResponse) => {
	const productAttributeService: ProductAttributeService = req.scope.resolve(
		PRODUCT_ATTRIBUTE_MODULE,
	);

	try {
		const { id } = req.params;
		const { name, description, rank, status } =
			req.body as ProductAttributeCategory;

		const updateData: ProductAttributeCategoryUpdate = {};

		if (name !== undefined) updateData.name = name;
		if (description !== undefined) updateData.description = description;
		if (rank !== undefined) updateData.rank = Number(rank);
		if (status !== undefined) updateData.status = status;

		const category =
			await productAttributeService.updateProductAttributeCategories({
				...updateData,
				id,
			});

		return res.json({ category });
	} catch (error) {
		return res.status(400).json({ message: error.message });
	}
};

export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
	const productAttributeService: ProductAttributeService = req.scope.resolve(
		PRODUCT_ATTRIBUTE_MODULE,
	);

	try {
		const { id } = req.params;

		await productAttributeService.deleteProductAttributeCategories({ id });

		return res
			.status(200)
			.json({ success: true, message: 'Category deleted successfully' });
	} catch (error) {
		return res.status(400).json({ message: error.message });
	}
};

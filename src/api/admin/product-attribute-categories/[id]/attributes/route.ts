import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { PRODUCT_ATTRIBUTE_MODULE } from '../../../../../modules/product-attributes';
import type ProductAttributeService from '../../../../../modules/product-attributes/service';
import type { AttributeIdsRequest } from '../../../../../types/category';

// Get all attributes in a category
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
	const productAttributeService: ProductAttributeService = req.scope.resolve(
		PRODUCT_ATTRIBUTE_MODULE,
	);

	try {
		const { id } = req.params;

		const category =
			await productAttributeService.retrieveProductAttributeCategory(id, {
				relations: ['attributes'],
			});

		return res.json({ attributes: category?.attributes || [] });
	} catch (error) {
		console.error('GET attributes error:', error);
		return res.status(400).json({ message: error.message });
	}
};

// Add attributes to a category
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
	const productAttributeService: ProductAttributeService = req.scope.resolve(
		PRODUCT_ATTRIBUTE_MODULE,
	);

	try {
		const { id } = req.params;
		const { attribute_ids } = req.body as AttributeIdsRequest;

		if (
			!attribute_ids ||
			!Array.isArray(attribute_ids) ||
			attribute_ids.length === 0
		) {
			return res
				.status(400)
				.json({ message: 'Valid attribute_ids array is required' });
		}

		// Verify that the category exists
		const category =
			await productAttributeService.retrieveProductAttributeCategory(id);
		if (!category) {
			return res.status(404).json({ message: 'Category not found' });
		}

		// Get current attributes to avoid duplicates
		const currentCategory =
			await productAttributeService.retrieveProductAttributeCategory(id, {
				relations: ['attributes'],
			});
		const currentAttributeIds =
			currentCategory?.attributes?.map((attr) => attr.id) || [];

		// Process each attribute
		for (const attributeId of attribute_ids) {
			// Skip if already associated
			if (currentAttributeIds.includes(attributeId)) {
				continue;
			}

			// Verify attribute exists
			const attribute =
				await productAttributeService.retrieveProductAttribute(attributeId);
			if (!attribute) {
				continue;
			}

			// Create the association using factory method
			await productAttributeService.createProductAttributeToCategories({
				attribute_id: attributeId,
				category_id: id,
			});
		}

		// Get the updated category with attributes
		const updatedCategory =
			await productAttributeService.retrieveProductAttributeCategory(id, {
				relations: ['attributes'],
			});

		return res.status(200).json({
			success: true,
			message: 'Attributes added to category successfully',
			attributes: updatedCategory?.attributes || [],
		});
	} catch (error) {
		console.error('POST: Error occurred', error);
		return res.status(400).json({ message: error.message });
	}
};

// Remove attributes from a category
export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
	const productAttributeService: ProductAttributeService = req.scope.resolve(
		PRODUCT_ATTRIBUTE_MODULE,
	);

	try {
		const { id } = req.params;
		const { attribute_ids } = req.body as AttributeIdsRequest;

		if (
			!attribute_ids ||
			!Array.isArray(attribute_ids) ||
			attribute_ids.length === 0
		) {
			return res
				.status(400)
				.json({ message: 'Valid attribute_ids array is required' });
		}

		// Verify that the category exists
		const category =
			await productAttributeService.retrieveProductAttributeCategory(id, {
				relations: ['attributes'],
			});

		if (!category) {
			return res.status(404).json({ message: 'Category not found' });
		}

		// For each attribute to remove, find the junction entries and delete them
		for (const attributeId of attribute_ids) {
			// Find the junction table entries for this category-attribute pair
			const associations =
				await productAttributeService.listProductAttributeToCategories({
					attribute_id: attributeId,
					category_id: id,
				});

			// Delete each association
			for (const association of associations) {
				await productAttributeService.deleteProductAttributeToCategories(
					association.id,
				);
			}
		}

		// Get the updated category with attributes
		const updatedCategory =
			await productAttributeService.retrieveProductAttributeCategory(id, {
				relations: ['attributes'],
			});

		return res.status(200).json({
			success: true,
			message: 'Attributes removed from category successfully',
			attributes: updatedCategory?.attributes || [],
		});
	} catch (error) {
		console.error('DELETE attributes error:', error);
		return res.status(400).json({ message: error.message });
	}
};

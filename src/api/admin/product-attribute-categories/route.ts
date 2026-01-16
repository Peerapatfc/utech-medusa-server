import type {
	AuthenticatedMedusaRequest,
	MedusaResponse,
} from '@medusajs/framework/http';
import {
	ContainerRegistrationKeys,
	remoteQueryObjectFromString,
} from '@medusajs/framework/utils';
import { PRODUCT_ATTRIBUTE_MODULE } from '../../../modules/product-attributes';
import type ProductAttributeService from '../../../modules/product-attributes/service';
import type { ProductAttributeCategory } from '../../../types/category';
import { adminProductAttributeCategoriesMiddlewares as middlewares } from './middlewares';
import type {
	AdminGetProductAttributeCategoriesParamsType,
	AdminPostProductAttributeCategoriesParamsType,
	AdminPutProductAttributeCategoriesBodyType,
} from './validators';

export const GET = async (
	req: AuthenticatedMedusaRequest<AdminGetProductAttributeCategoriesParamsType>,
	res: MedusaResponse,
) => {
	const remoteQuery = req.scope.resolve(ContainerRegistrationKeys.REMOTE_QUERY);

	try {
		const query = remoteQueryObjectFromString({
			entryPoint: 'product_attribute_category',
			variables: {
				filters: req.filterableFields,
				...req.queryConfig.pagination,
			},
			fields: req?.queryConfig?.fields,
		});

		const { rows: categories, metadata } = await remoteQuery(query);

		return res.json({
			categories,
			count: metadata?.count,
			limit: metadata?.take,
			offset: metadata?.skip,
		});
	} catch (error) {
		return res.status(400).json({ message: error.message });
	}
};

export const POST = async (
	req: AuthenticatedMedusaRequest & {
		validatedBody: AdminPostProductAttributeCategoriesParamsType;
	},
	res: MedusaResponse,
) => {
	const productAttributeService: ProductAttributeService = req.scope.resolve(
		PRODUCT_ATTRIBUTE_MODULE,
	);

	try {
		const { name, description, rank, status, metadata } = req.validatedBody;

		const categoryData: Omit<ProductAttributeCategory, 'id' | 'attributes'> = {
			name,
			description,
			rank,
			status,
			metadata,
		};

		const category =
			await productAttributeService.createProductAttributeCategories(
				categoryData,
			);

		return res.status(201).json({ category });
	} catch (error) {
		return res.status(400).json({ message: error.message });
	}
};

export const PUT = async (
	req: AuthenticatedMedusaRequest & {
		validatedBody: AdminPutProductAttributeCategoriesBodyType;
	},
	res: MedusaResponse,
) => {
	const productAttributeService: ProductAttributeService = req.scope.resolve(
		PRODUCT_ATTRIBUTE_MODULE,
	);

	try {
		const { categories } = req.validatedBody; // Access the array via .categories

		const updatedCategories =
			await productAttributeService.updateProductAttributeCategories(
				categories,
			);

		return res.status(201).json({ categories: updatedCategories });
	} catch (error) {
		return res.status(400).json({ message: error.message });
	}
};

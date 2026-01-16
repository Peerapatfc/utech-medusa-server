import {
	authenticate,
	type MedusaNextFunction,
	type MedusaRequest,
	type MedusaResponse,
	type MiddlewareRoute,
} from '@medusajs/framework/http';
import type {
	FilterableProductProps,
	IProductModuleService,
} from '@medusajs/framework/types';
import { Modules, ProductStatus } from '@medusajs/framework/utils';
import { PRODUCT_ATTRIBUTE_MODULE } from '../../../../modules/product-attributes';
import type ProductAttributeService from '../../../../modules/product-attributes/service';
import { getChildrenCategoryIds } from './helper';

type CustomFilterableProductProps = FilterableProductProps & {
	metadata: Record<string, unknown>;
	$or?: Record<string, unknown>[];
};

const transformSearchQueryToFilter = async (
	req: MedusaRequest,
	_res: MedusaResponse,
	next: MedusaNextFunction,
) => {
	const productModuleService: IProductModuleService = req.scope.resolve(
		Modules.PRODUCT,
	);
	const productAttributeService: ProductAttributeService = req.scope.resolve(
		PRODUCT_ATTRIBUTE_MODULE,
	);

	const queryFields = req.query;

	const filterableAttributes =
		await productAttributeService.listProductAttributes({
			is_filterable: true,
			status: true,
		});
	const filterListAttributes = filterableAttributes.map((attr) => attr.code);

	const metadataFilters = {} as Record<string, unknown>;
	for (const key in queryFields) {
		if (!queryFields[key]) continue;

		if (filterListAttributes.includes(key)) {
			metadataFilters[key] = (queryFields[key] as string).split(',');
		}
	}

	if (queryFields.sku) {
		metadataFilters.sku = queryFields.sku;
	}

	const filters = {
		status: ProductStatus.PUBLISHED,
		metadata: metadataFilters,
		$and: [],
	} as CustomFilterableProductProps;

	if (queryFields.id) {
		filters.id = queryFields.id as string[];
	}

	if (queryFields.category_id) {
		const childrenIds = await getChildrenCategoryIds({
			container: req.scope,
			categoryIds: [queryFields.category_id as string],
		});

		filters.$and.push({
			categories: {
				id: {
					$in: [queryFields.category_id as string, ...childrenIds],
				},
			},
		});
	}

	if (queryFields.category) {
		const [category] = await productModuleService.listProductCategories(
			{
				handle: queryFields.category as string,
			},
			{
				select: ['id'],
				take: 1,
			},
		);

		if (category) {
			const childrenIds = await getChildrenCategoryIds({
				container: req.scope,
				categoryIds: [category.id],
			});

			filters.$and.push({
				categories: {
					id: {
						$in: [category.id, ...childrenIds],
					},
				},
			});
		}
	}

	if (queryFields.collection_id) {
		filters.collection_id = queryFields.collection_id as string;
	}

	if (queryFields.id && typeof queryFields.id === 'string') {
		filters.id = queryFields.id.split(',');
	}

	if (queryFields.price) {
		const priceRange = queryFields.price as string;
		const [min, max] = priceRange.split('_');

		const isInvalidPrice =
			Number.isNaN(Number.parseInt(min)) || Number.isNaN(Number.parseInt(max));
		if (!isInvalidPrice) {
			filters.metadata = {
				...filters.metadata,
			};
			filters.$or = [
				{
					metadata: {
						min_calculated_price: {
							$gte: Number.parseInt(min),
							$lte: Number.parseInt(max),
						},
					},
				},
				{
					metadata: {
						max_calculated_price: {
							$gte: Number.parseInt(min),
							$lte: Number.parseInt(max),
						},
					},
				},
			];
		}
	}

	if (queryFields.show_available_only) {
		filters.metadata = {
			...filters.metadata,
			inventory_quantity: {
				$ne: null,
			},
		};
	}

	req.filterableFields = filters as unknown as Record<string, unknown>;

	next();
};

const transformQueryToPagitation = async (
	req: MedusaRequest,
	_res: MedusaResponse,
	next: MedusaNextFunction,
) => {
	const queryFields = req.query;
	const limit = queryFields.limit
		? Number.parseInt(queryFields.limit as string)
		: 20;
	const offset = queryFields.offset
		? Number.parseInt(queryFields.offset as string)
		: 0;

	const paginationOrder: Record<string, unknown> = {
		metadata: {
			inventory_quantity: 'NULLS LAST',
		},
	};

	if (!req.queryConfig) {
		req.queryConfig = {
			fields: [],
			pagination: {
				order: null,
				take: limit,
				skip: offset,
			},
		};
	}

	const filterIds = req.filterableFields.id as string[];
	const hasSortingIds = filterIds && filterIds.length > 0;
	if (queryFields.order || !hasSortingIds) {
		// if not a product search result, will sort by created_at defaultly
		paginationOrder.created_at = 'DESC';
	}

	//@ts-ignore
	req.queryConfig.pagination.order = paginationOrder;

	next();
};

export const storeCustomProductRoutesMiddlewares: MiddlewareRoute[] = [
	{
		method: ['GET'],
		matcher: '/store/custom/products',
		middlewares: [transformSearchQueryToFilter, transformQueryToPagitation],
	},
	{
		method: ['POST'],
		matcher: '/store/custom/products/:id/views',
		middlewares: [
			authenticate(['customer'], ['session', 'bearer'], {
				allowUnauthenticated: true,
			}),
		],
	},
];

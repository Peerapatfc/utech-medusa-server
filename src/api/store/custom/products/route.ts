import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import type { Logger } from '@medusajs/framework/types';
import type { ProductDTO } from '@medusajs/types';
import getProductDetailWorkflow from '../../../../workflows/product/get-products-detail';
import {
	cleanUpProducts,
	mapFlashSaleProducts,
	mapProductAttributes,
	removeServiceProducts,
} from './helper';
import { sortByCollectionRank, sortByIds, sortByPrice } from './util';

export async function GET(
	req: MedusaRequest,
	res: MedusaResponse,
): Promise<void> {
	const logger: Logger = req.scope.resolve('logger');
	const queryFields = req.query;
	const { order = 'created_at', collection_id } = queryFields;
	const query = req.scope.resolve('query');
	const hasSortingPrice = ['price_asc', 'price_desc'].includes(order as string);
	const isCollectionPage = !!collection_id;

	const filterIds = req.filterableFields.id as string[];
	const hasSortingIds =
		filterIds && filterIds.length > 0 && order === 'relevant';

	const isSearchNoLimit = hasSortingPrice || isCollectionPage || hasSortingIds;

	try {
		const { data: allProducts, metadata } = (await query.graph({
			entity: 'product',
			filters: {
				...req.filterableFields,
			},
			fields: [
				'id',
				'type_id',
				'metadata.min_calculated_price',
				'metadata.inventory_quantity',
			],
			pagination: {
				...req.queryConfig.pagination,
				skip: isSearchNoLimit ? 0 : req.queryConfig.pagination.skip,
				take: isSearchNoLimit ? 2000 : req.queryConfig.pagination.take,
			},
		})) as { data: ProductDTO[]; metadata: { count: number } };

		let _products = [...allProducts];

		if (hasSortingIds) {
			_products = sortByIds(_products, filterIds);
		}

		if (hasSortingPrice) {
			const sortedProducts = sortByPrice(
				allProducts,
				order as 'price_asc' | 'price_desc',
			);
			_products = [...sortedProducts];
		}

		if (isCollectionPage && !hasSortingPrice) {
			const sortedProducts = sortByCollectionRank(allProducts);
			_products = [...sortedProducts];
		}

		//TODO: remove this filtering
		const nonServiceProducts = await removeServiceProducts(req, _products);

		let productIds = nonServiceProducts.map((product) => product.id);
		if (isSearchNoLimit) {
			const { take, skip } = req.queryConfig.pagination;
			const limitedSortingPriceProducts = nonServiceProducts.slice(
				skip,
				skip + take,
			);
			productIds = limitedSortingPriceProducts.map((product) => product.id);
		}

		const count = metadata?.count || 0;
		const { result: productResults } = await getProductDetailWorkflow(
			req.scope,
		).run({
			input: {
				productIds,
			},
		});

		let products = [...productResults];

		if (hasSortingIds) {
			products = sortByIds(productResults, filterIds);
		}

		if (hasSortingPrice) {
			const sortedProducts = sortByPrice(
				products,
				order as 'price_asc' | 'price_desc',
			);
			products = [...sortedProducts];
		}

		if (isCollectionPage && !hasSortingPrice) {
			const sortedProducts = sortByCollectionRank(products);
			products = [...sortedProducts];
		}

		products = await mapProductAttributes(req, products);
		products = await mapFlashSaleProducts({
			container: req.scope,
			products,
		});

		products = cleanUpProducts(products);

		res.json({
			products,
			count,
			offset: req.queryConfig?.pagination?.skip || 0,
			limit: req.queryConfig?.pagination?.take || 20,
		});
	} catch (error) {
		logger.error(`Error fetching products error: ${error.message}`, error);
		res.status(500).json({
			error: 'An error occurred while fetching products',
			error_message: error.message,
		});
	}
}

import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import {
	type CreateTopSearchesBody,
	TopSearchType,
} from '../../../types/top-search';
import type SearchLogModuleService from '../../../modules/search-log/service';
import { SEARCH_LOG_MODILE_SERVICE } from '../../../modules/search-log';
import type ConfigDataModuleService from '../../../modules/config-data/service';
import { CONFIG_DATA_MODULE } from '../../../modules/config-data';
import { ConfigDataPath } from '../../../types/config-data';
import { findConfigDataByPath } from '../../../utils/config-data';
import {
	ContainerRegistrationKeys,
	ProductStatus,
} from '@medusajs/framework/utils';
import getProductDetailWorkflow from '../../../workflows/product/get-products-detail';

const LIMIT = 10;

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
	const configDataModuleService: ConfigDataModuleService =
		req.scope.resolve(CONFIG_DATA_MODULE);
	const config = await configDataModuleService.getByPaths([
		ConfigDataPath.TOP_SEARCH_GENERAL_ENABLED,
		ConfigDataPath.TOP_SEARCH_GENERAL_DISPLAY_MODE,
		ConfigDataPath.RECENT_SEARCH_GENERAL_ENABLED,
		ConfigDataPath.RECENT_SEARCH_GENERAL_PROHIBITED_WORD,
	]);
	const top_enabled = findConfigDataByPath(
		config,
		ConfigDataPath.TOP_SEARCH_GENERAL_ENABLED,
	);
	const display_mode = findConfigDataByPath(
		config,
		ConfigDataPath.TOP_SEARCH_GENERAL_DISPLAY_MODE,
	);

	const searchLogService: SearchLogModuleService = req.scope.resolve(
		SEARCH_LOG_MODILE_SERVICE,
	);

	const suggestProducts = await getSuggestProducts(req);

	const top_searches: CreateTopSearchesBody[] = [];
	if (top_enabled !== '1') {
		res.json({
			success: true,
			top_searches: [],
			suggestion_products: suggestProducts,
		});
		return;
	}

	const recommends = await searchLogService.listTopSearches(
		{
			type: TopSearchType.RECOMMEND,
		},
		{
			order: {
				created_at: 'ASC',
			},
			take: LIMIT,
		},
	);

	const searchEngines = await searchLogService.listTopSearches(
		{
			type: TopSearchType.SEARCH_ENGINE,
		},
		{
			order: {
				count: 'DESC',
			},
			take: LIMIT,
		},
	);

	if (display_mode === 'search-engine') {
		searchEngines.map((searchEngine) => {
			top_searches.push({
				id: searchEngine.id,
				search: searchEngine.search,
				type: searchEngine.type,
				uri: searchEngine.search,
			});
		});
	}

	if (display_mode === 'recommend') {
		recommends.map((recommend) => {
			top_searches.push({
				id: recommend.id,
				search: recommend.search,
				type: recommend.type,
				uri: recommend.uri,
			});
		});
	}

	if (display_mode === 'both') {
		const dataRecommends =
			recommends.length > LIMIT ? recommends.slice(0, LIMIT) : recommends;
		const recommendsCount = dataRecommends.length || 0;
		const dataSearchEngines = searchEngines.slice(0, LIMIT - recommendsCount);

		dataSearchEngines.map((searchEngine) => {
			top_searches.push({
				id: searchEngine.id,
				search: searchEngine.search,
				type: searchEngine.type,
				uri: searchEngine.search,
			});
		});

		dataRecommends.map((recommend) => {
			top_searches.push({
				id: recommend.id,
				search: recommend.search,
				type: recommend.type,
				uri: recommend.uri,
			});
		});
	}

	res.json({
		success: true,
		top_searches,
		suggestion_products: suggestProducts,
	});
};

const getSuggestProducts = async (req: MedusaRequest) => {
	const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
	const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER);

	try {
		const { data } = await query.graph({
			entity: 'product',
			fields: ['id', 'metadata'],
			filters: {
				//@ts-ignore
				status: ProductStatus.PUBLISHED,
				metadata: {
					suggestion_score: {
						$gte: 0,
					},
				},
			},
			pagination: {
				take: 2000,
				order: {
					created_at: 'DESC',
				},
			},
		});

		const scoredProducts = data.map((product) => {
			const suggestion_score =
				(product.metadata?.suggestion_score as number) || 0;
			return {
				id: product.id as string,
				suggestion_score,
			};
		});

		const sortedScoredProducts = scoredProducts.sort((a, b) => {
			return b.suggestion_score - a.suggestion_score;
		});

		const limitScoredProducts = sortedScoredProducts.slice(0, 6);
		const productIds = limitScoredProducts.map((product) => product.id);
		if (productIds.length === 0) {
			return [];
		}

		const { result: productResults } = await getProductDetailWorkflow(
			req.scope,
		).run({
			input: {
				productIds,
			},
		});

		const productResultsMap = new Map(
			productResults.map((product) => [product.id, product]),
		);
		const sortedProductResults = limitScoredProducts.map((product) => {
			return productResultsMap.get(product.id);
		});

		return sortedProductResults;
	} catch (error) {
		logger.error('Error fetching suggest products:', error?.message);
		return [];
	}
};

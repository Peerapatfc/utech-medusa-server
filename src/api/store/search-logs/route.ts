import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { SEARCH_LOG_MODILE_SERVICE } from "../../../modules/search-log";
import type SearchLogModuleService from "../../../modules/search-log/service";
import type ConfigDataModuleService from "../../../modules/config-data/service";
import { CONFIG_DATA_MODULE } from "../../../modules/config-data";
import { ConfigDataPath } from "../../../types/config-data";
import { findConfigDataByPath } from "../../../utils/config-data";
import StorefrontModuleService from "../../../modules/storefront/service";
import { STOREFRONT_MODULE } from "../../../modules/storefront";

interface SearchLogReq {
	search: string;
}

export const POST = async (
	req: MedusaRequest<SearchLogReq>,
	res: MedusaResponse,
) => {
	const searchLogModuleService: SearchLogModuleService = req.scope.resolve(
		SEARCH_LOG_MODILE_SERVICE,
	);
	const searchText = req.body.search;
	if (!searchText) {
		res.status(400).json({
			message: "some value is required",
		});
		return;
	}
	const configDataModuleService: ConfigDataModuleService =
		req.scope.resolve(CONFIG_DATA_MODULE);
	const config = await configDataModuleService.getByPaths([
		ConfigDataPath.RECENT_SEARCH_GENERAL_ENABLED,
		ConfigDataPath.RECENT_SEARCH_GENERAL_PROHIBITED_WORD,
	]);
	const recent_enabled = findConfigDataByPath(
		config,
		ConfigDataPath.RECENT_SEARCH_GENERAL_ENABLED,
	);
	const prohibited_word = findConfigDataByPath(
		config,
		ConfigDataPath.RECENT_SEARCH_GENERAL_PROHIBITED_WORD,
	);
	const message = searchLogModuleService.validateProhibitedWord(
		recent_enabled,
		prohibited_word,
		searchText,
	);

	if (message === "success") {
		await searchLogModuleService.saveSearchLog({ search: searchText });

		const storefrontService: StorefrontModuleService =
			req.scope.resolve(STOREFRONT_MODULE);
		await storefrontService.revalidateTag("top-searches");
	}

	return res.json({
		message,
	});
};

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
	const searchLogModuleService: SearchLogModuleService = req.scope.resolve(
		SEARCH_LOG_MODILE_SERVICE,
	);
	const searchText = req.query.search as string;
	if (!searchText) {
		res.status(400).json({
			message: "some value is required",
		});
		return;
	}
	const configDataModuleService: ConfigDataModuleService =
		req.scope.resolve(CONFIG_DATA_MODULE);
	const config = await configDataModuleService.getByPaths([
		ConfigDataPath.RECENT_SEARCH_GENERAL_ENABLED,
		ConfigDataPath.RECENT_SEARCH_GENERAL_PROHIBITED_WORD,
	]);
	const recent_enabled = findConfigDataByPath(
		config,
		ConfigDataPath.RECENT_SEARCH_GENERAL_ENABLED,
	);
	const prohibited_word = findConfigDataByPath(
		config,
		ConfigDataPath.RECENT_SEARCH_GENERAL_PROHIBITED_WORD,
	);
	const message = searchLogModuleService.validateProhibitedWord(
		recent_enabled,
		prohibited_word,
		searchText,
	);
	return res.json({
		message,
	});
};

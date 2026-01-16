import type { MedusaContainer } from '@medusajs/framework';
import { StepResponse, createStep } from '@medusajs/framework/workflows-sdk';
import { SEARCH_LOG_MODILE_SERVICE } from '../../../../modules/search-log';
import type SearchLogModuleService from '../../../../modules/search-log/service';

export type GetMostSearchedKeywordsStepInput = {
	limit?: number;
};

export const getMostSearchedKeywordsStep = createStep(
	'get-most-searched-keywords-step',
	async (
		input: GetMostSearchedKeywordsStepInput,
		context: { container: MedusaContainer },
	) => {
		const searchLogService: SearchLogModuleService = context.container.resolve(
			SEARCH_LOG_MODILE_SERVICE,
		);

		const topSearches = await searchLogService.listTopSearches(
			{},
			{
				take: input.limit,
				order: {
					count: 'desc',
				},
			},
		);

		const keywordData = topSearches.map((log) => ({
			keyword: log.search,
			count: log.count,
		}));

		return new StepResponse(keywordData);
	},
);

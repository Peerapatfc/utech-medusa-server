import TopSearch from './models/top-search';
import SearchLog from './models/search-logs';
import { MedusaService } from '@medusajs/framework/utils';
import type {
	IProductModuleService,
	Logger,
	IEventBusService,
} from '@medusajs/framework/types';

class SearchLogModuleService extends MedusaService({
	SearchLog,
	TopSearch,
}) {
	protected logger: Logger;
	protected eventBusService: IEventBusService;
	protected productService: IProductModuleService;
	public Events = {
		SEARCH_LOG_CREATED: 'search-log.created',
	};

	constructor({
		logger,
		event_bus,
		product,
	}: {
		logger: Logger;
		event_bus: IEventBusService;
		product: IProductModuleService;
	}) {
		// biome-ignore lint/style/noArguments: <explanation>
		super(...arguments);

		this.logger = logger;
		this.eventBusService = event_bus;
		this.productService = product;
	}

	async saveSearchLog(data: { search: string }) {
		// const products = await this.productService.listProducts({}, { take: 2 })
		const searchLog = await this.createSearchLogs(data);
		this.eventBusService
			.emit({
				name: this.Events.SEARCH_LOG_CREATED,
				data: searchLog,
			})
			.then(() => {
				this.logger.info(`Search log created: ${searchLog.search}`);
			});
	}

	validateProhibitedWord(
		recent_enabled: string,
		prohibited_word: string,
		searchText: string,
	): 'success' | 'error' {
		if (recent_enabled !== '1' || !prohibited_word) {
			return 'success';
		}

		const words = prohibited_word
			.split(',')
			.map((word) => word.trim())
			.filter(Boolean); // Remove empty strings

		const hasProhibitedWord = words.some((word) =>
			new RegExp(word, 'i').test(searchText),
		);

		return hasProhibitedWord ? 'error' : 'success';
	}
}

export default SearchLogModuleService;

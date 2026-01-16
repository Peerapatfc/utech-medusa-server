import type {
	Logger,
	ProviderSendNotificationDTO,
	ProviderSendNotificationResultsDTO,
} from '@medusajs/framework/types';
import {
	AbstractNotificationProviderService,
	MedusaError,
} from '@medusajs/framework/utils';
import { Redis } from 'ioredis';
import { v4 as uuidv4 } from 'uuid';

type InjectedDependencies = {
	logger: Logger;
};

type Options = {
	redisUrl: string;
};

class MyNotificationProviderService extends AbstractNotificationProviderService {
	static identifier = 'my-notification';
	protected logger_: Logger;
	protected options_: Options;
	protected client: Redis;

	constructor({ logger }: InjectedDependencies, options: Options) {
		super();
		this.logger_ = logger;
		this.options_ = options;

		this.init();
	}

	static validateOptions(options: Record<string, string>) {
		if (!options.redisUrl) {
			throw new MedusaError(
				MedusaError.Types.INVALID_DATA,
				"Redis URL is required in the provider's options.",
			);
		}
	}

	async init() {
		this.client = new Redis(this.options_.redisUrl);
	}

	async send(
		notification: ProviderSendNotificationDTO,
	): Promise<ProviderSendNotificationResultsDTO> {
		const id = uuidv4();
		await this.client.publish(
			'store-notification',
			JSON.stringify({
				id,
				recipient_id: notification.to,
				subject: notification.content?.subject,
				text: notification.content?.text,
				published_at: new Date().toISOString(),
			}),
		);

		this.logger_.info(`Store Notification sent with id: ${id}`);

		return {
			id,
		};
	}
}

export default MyNotificationProviderService;

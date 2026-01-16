import {
	AbstractEventBusModuleService,
	MedusaService,
} from '@medusajs/framework/utils';
import { ProductView, ProductViewCount } from './models/product-view';

class PersonalizationModuleService extends MedusaService({
	ProductView,
	ProductViewCount,
}) {
	protected eventBusService_: AbstractEventBusModuleService;

	constructor({ event_bus }) {
		// biome-ignore lint/style/noArguments: <explanation>
		super(...arguments);

		this.eventBusService_ = event_bus;
	}

	async recordProductView(data: any) {
		return this.createProductViews(data).then((pv) => {
			this.eventBusService_.emit(
				{
					name: 'product.viewed',
					data: pv,
				},
				{},
			);
		});
	}
}

export default PersonalizationModuleService;

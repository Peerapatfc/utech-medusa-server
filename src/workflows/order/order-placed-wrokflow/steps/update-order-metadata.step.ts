import { createStep, StepResponse } from '@medusajs/framework/workflows-sdk';
import type {
	CartDTO,
	IOrderModuleService,
	IPaymentModuleService,
	Logger,
	OrderDTO,
	PaymentCollectionDTO,
} from '@medusajs/framework/types';
import { Modules } from '@medusajs/framework/utils';
import type ConfigDataModuleService from '../../../../modules/config-data/service';
import { CONFIG_DATA_MODULE } from '../../../../modules/config-data';
import { ConfigDataPath } from '../../../../types/config-data';
import dayjs from 'dayjs';

interface UpdateOrderMetadataInput {
	generatedOrderNo: string;
	order: OrderDTO;
	cart: CartDTO;
	payment_collection: PaymentCollectionDTO;
}

const updateOrderMetadataStep = createStep(
	'update-order-metadata-step',
	async (input: UpdateOrderMetadataInput, { container }) => {
		const { generatedOrderNo, order, payment_collection, cart } = input;
		const logger: Logger = container.resolve('logger');
		const paymentModuleService: IPaymentModuleService = container.resolve(
			Modules.PAYMENT,
		);
		const configDataService: ConfigDataModuleService =
			container.resolve(CONFIG_DATA_MODULE);
		const orderService: IOrderModuleService = container.resolve(Modules.ORDER);

		const paymentCollection =
			await paymentModuleService.retrievePaymentCollection(
				payment_collection.id,
				{
					relations: ['payments'],
				},
			);

		const payment =
			paymentCollection?.payments?.sort((a, b) => {
				return (
					new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
				);
			})?.[0] || null;

		const orderCreatedAt = order.created_at || '';
		const paymentProviderId = payment?.provider_id;
		const paymentProviderPath = `${ConfigDataPath.CANCEL_ORDER_GENERAL_CONDITION}/${paymentProviderId}`;
		const paymentConfigProviders = await configDataService.getByPaths([
			paymentProviderPath,
		]);

		let paymentExpiration = '';
		if (paymentConfigProviders.length > 0) {
			const paymentConfigProvider = paymentConfigProviders[0];
			const munitesTime = paymentConfigProvider.value;
			if (munitesTime) {
				const munitesTimeInt = Number.parseInt(munitesTime);
				paymentExpiration = dayjs(orderCreatedAt)
					.add(munitesTimeInt, 'minutes')
					.toISOString();
			}
		}

		const metadataToUpdate = {
			order_no: generatedOrderNo,
			payment_invoice_no: payment.data?.invoiceNo || '',
			payment_id: payment.id || '',
			payment_collection_id: paymentCollection.id || '',
			payment_expiration: paymentExpiration,
			pre_order: cart.metadata?.pre_order || undefined,
			is_pre_order: cart.metadata?.is_pre_order || undefined,
			pickup_option: cart.metadata?.pickup_option || undefined,
		};

		await orderService.updateOrders([
			{
				id: order.id,
				metadata: {
					...metadataToUpdate,
				},
			},
		]);

		const previousData = {};
		return new StepResponse(metadataToUpdate, {
			previousData,
		});
	},
	async (_input, _context) => {},
);

export default updateOrderMetadataStep;

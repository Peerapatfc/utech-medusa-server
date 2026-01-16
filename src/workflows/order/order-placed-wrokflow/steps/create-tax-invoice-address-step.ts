import { createStep, StepResponse } from '@medusajs/framework/workflows-sdk';
import type {
	CartDTO,
	ICartModuleService,
	IOrderModuleService,
	Logger,
	OrderDTO,
} from '@medusajs/framework/types';
import { Modules } from '@medusajs/framework/utils';

interface CreateOrderTaxInvoiceAddressInput {
	order: OrderDTO;
	cart: CartDTO;
}

const createOrderTaxInvoiceAddressStep = createStep(
	'create-order-tax-invoice-address-step',
	async (input: CreateOrderTaxInvoiceAddressInput, { container }) => {
		const logger: Logger = container.resolve('logger');
		const cartTaxInvoiceAddressId = input.cart?.metadata
			?.tax_invoice_address_id as string;
		if (!cartTaxInvoiceAddressId) {
			logger.info('No tax invoice address found in cart');
			return;
		}

		const cartService: ICartModuleService = container.resolve(Modules.CART);
		const orderService: IOrderModuleService = container.resolve(Modules.ORDER);
		const cartTaxInvoiceAddress = await cartService
			.listAddresses(
				{
					id: cartTaxInvoiceAddressId,
				},
				{
					take: 1,
				},
			)
			.then((res) => res[0]);
		if (!cartTaxInvoiceAddress) {
			logger.info('No tax invoice address found in cart');
			return;
		}

		cartTaxInvoiceAddress.id = undefined;
		cartTaxInvoiceAddress.created_at = undefined;
		cartTaxInvoiceAddress.updated_at = undefined;

		const orderTaxInvoiceAddress = await orderService.createOrderAddresses(
			cartTaxInvoiceAddress,
		);

		if (orderTaxInvoiceAddress) {
			await orderService.updateOrders(input.order.id, {
				metadata: {
					tax_invoice_address_id: orderTaxInvoiceAddress.id,
				},
			});
		}

		const previousData = {
			orderId: input.order.id,
			created_order_address_id: orderTaxInvoiceAddress.id,
		};
		return new StepResponse(
			{},
			{
				previousData,
			},
		);
	},
	async (_input, _context) => {},
);

export default createOrderTaxInvoiceAddressStep;

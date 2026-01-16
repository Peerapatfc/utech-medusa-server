import type { MedusaRequest, MedusaResponse } from '@medusajs/framework';
import type { IPaymentModuleService } from '@medusajs/framework/types';
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils';

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
	const cartId = req.params.id;
	const paymentService: IPaymentModuleService = req.scope.resolve(
		Modules.PAYMENT,
	);

	const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
	const { data } = await query.graph({
		entity: 'cart',
		fields: [
			'id',
			'metadata',
			'region_id',
			'currency_code',
			// @ts-ignore
			'total',
			// @ts-ignore
			'raw_total',
			'payment_collection.id',
			// @ts-ignore
			'payment_collection.raw_amount',
			//@ts-ignore
			'payment_collection.amount',
			'payment_collection.currency_code',
			// @ts-ignore
			'payment_collection.payment_sessions.id',
		],
		filters: {
			id: cartId,
		},
		pagination: {
			take: 1,
			skip: 0,
		},
	});

	const cart = data[0];
	const paymentCollection = cart.payment_collection;
	// @ts-ignore
	const paymentSession = cart.payment_collection?.payment_sessions?.[0];
	if (!cart) {
		res.status(200).json({
			success: false,
			message: 'Cart not found',
		});
		return;
	}

	if (!paymentSession) {
		res.status(200).json({
			success: false,
			message: 'Cart does not have a payment session',
		});
		return;
	}

	if (!cart.metadata?.is_pre_order) {
		res.status(200).json({
			success: false,
			message: 'Cart is not a pre-order cart',
		});
		return;
	}

	if (!paymentCollection) {
		res.status(200).json({
			success: false,
			message: 'Cart does not have a payment collection',
		});
		return;
	}

	await paymentService.updatePaymentCollections(paymentCollection.id, {
		// @ts-ignore
		amount: cart.total,
	});
	await paymentService.updatePaymentSession({
		id: paymentSession.id,
		// @ts-ignore
		amount: cart.total,
		currency_code: cart.currency_code,
		data: {
			// @ts-ignore
			amount: cart.total,
		},
	});

	res.status(200).json({
		success: true,
	});
};

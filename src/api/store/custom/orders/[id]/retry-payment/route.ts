import type {
	AuthenticatedMedusaRequest,
	MedusaResponse,
} from '@medusajs/framework';
import paymentInquiryWorkflow from '../../../../../../workflows/payment-inquiry';
import { getOrderDetailWorkflow } from '@medusajs/medusa/core-flows';

export const GET = async (
	req: AuthenticatedMedusaRequest,
	res: MedusaResponse,
) => {
	const { id } = req.params;
	const customer_id = req.auth_context.actor_id;

	const { result: inquiry } = await paymentInquiryWorkflow(req.scope).run({
		input: {
			orderId: id,
		},
	});

	const { result: order } = await getOrderDetailWorkflow(req.scope).run({
		input: {
			fields: [
				'customer_id',
				'status',
				'payment_collections.*',
				'payment_collections.payments.*',
			],
			order_id: id,
		},
	});

	const orderData = {
		id: order.id,
		status: order.status,
		payment_status: order.payment_status,
		fulfillment_status: order.fulfillment_status,
	};

	if (inquiry.inquiry?.status === 'cancelled') {
		res.status(200).json({
			status: 'failed',
			message: 'Payment has been canceled.',
			payment_url: null,
			order: orderData,
		});
		return;
	}

	if (customer_id !== order.customer_id) {
		res.status(400).json({
			status: 'bad_request',
			message: 'Order not match with your account.',
			payment_url: null,
			order: orderData,
		});
		return;
	}

	const payment_url =
		order?.payment_collections?.[0]?.payments?.[0]?.data
			?.payment_token_result?.[
			// biome-ignore lint/complexity/useLiteralKeys: <explanation>
			'webPaymentUrl'
		];

	if (!payment_url) {
		res.status(400).json({
			status: 'bad_request',
			message: 'Find not found the payment link.',
			payment_url: null,
			order: orderData,
		});
		return;
	}

	if (order.status === 'pending' && order.payment_status === 'authorized') {
		res.status(200).json({
			status: 'success',
			message: '',
			payment_url,
			order: orderData,
		});
		return;
	}

	res.status(200).json({
		status: 'failed',
		message: 'Cannot retry payment.',
		payment_url: null,
		order: orderData,
	});
};

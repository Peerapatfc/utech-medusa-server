import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import jwt from 'jsonwebtoken';
import type { IPaymentModuleService, Logger } from '@medusajs/framework/types';
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils';
import type { PaymentHookData } from './type';
import { ResponseCode } from '../../../../modules/payment/2c2p/types';
import { capturePaymentWorkflow } from '@medusajs/medusa/core-flows';
import type AdminModuleService from '../../../../modules/admin/service';
import { ADMIN_MODULE } from '../../../../modules/admin';

interface PaymentHookRequest {
	payload: string;
}

export const POST = async (
	req: MedusaRequest<PaymentHookRequest>,
	res: MedusaResponse,
) => {
	const logger: Logger = req.scope.resolve('logger');
	const adminService: AdminModuleService = req.scope.resolve(ADMIN_MODULE);
	const paymentService: IPaymentModuleService = req.scope.resolve(
		Modules.PAYMENT,
	);
	const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
	const { payload } = req.body;

	try {
		adminService.createHookLogs({
			path: '/hooks/payment/2c2p',
			body: req.body as unknown as Record<string, unknown>,
			method: 'POST',
			name: 'Raw request body from 2c2p',
			actor_id: 'system',
		});
	} catch (error) {}

	try {
		const secretKey = process.env.PAYMENT_2C2P_MERCHANT_SECRET_KEY;
		const decodedPayload = jwt.verify(payload, secretKey) as PaymentHookData;
		const paymentSessionId = decodedPayload.userDefined1;

		logger.info(
			`Payment hook received for payment session:${paymentSessionId}, response code: ${decodedPayload.respCode}`,
		);

		if (!paymentSessionId) {
			logger.error('No userDefined1 found in the payload from 2c2p');
			return res.status(400).json({ success: false });
		}

		adminService.createHookLogs({
			path: '/hooks/payment/2c2p',
			body: decodedPayload as unknown as Record<string, unknown>,
			method: 'POST',
			name: 'Decoded payload from 2c2p',
			actor_id: 'system',
		});

		const {
			data: [paymentSession],
		} = await query.graph({
			entity: 'payment_session',
			filters: {
				id: paymentSessionId,
			},
			fields: [
				'id',
				'payment.id',
				'payment_collection.id',
				'payment_collection.metadata',
				'payment_collection.order.metadata',
			],
			pagination: {
				take: 1,
				skip: 0,
			},
		});

		if (paymentSession?.payment_collection) {
			const paymentCollectionMetaData = {
				...(paymentSession.payment_collection.metadata || {}),
				payment_post_back: decodedPayload,
			};

			await paymentService.updatePaymentCollections(
				paymentSession.payment_collection.id,
				{
					metadata: paymentCollectionMetaData,
				},
			);
		}

		const payment = paymentSession?.payment;
		const order = paymentSession?.payment_collection?.order;

		logger.info(
			`Payment hook received for order:${order?.id}, payment session:${paymentSessionId}, paymentId:${payment.id} , response code: ${decodedPayload.respCode}`,
		);
		if (payment && decodedPayload.respCode === ResponseCode.SUCCESS) {
			const workflow = capturePaymentWorkflow(req.scope);
			await workflow.run({
				input: {
					payment_id: payment.id,
				},
			});

			adminService.createAdminLogs({
				action: 'captured',
				resource_id: order?.id,
				resource_type: 'payment',
				actor_id: 'system',
				metadata: {
					order_id: order?.id,
					order_no: order?.metadata?.order_no,
				},
			});

			logger.info(
				`Payment captured for order:${order?.id} payment session:${paymentSessionId}, paymentId:${payment.id}`,
			);
		}

		res.status(200).json({ success: true });
	} catch (error) {
		logger.error(`Error in 2c2p payment hook: ${error.message}`);
		res.status(500).json({ success: false });
	}
};

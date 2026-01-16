import { createStep, StepResponse } from '@medusajs/framework/workflows-sdk';
import type { PaymentInquiryInput } from '../index';
import type {
	IOrderModuleService,
	IPaymentModuleService,
	Logger,
	PaymentDTO,
} from '@medusajs/framework/types';
import { Modules } from '@medusajs/framework/utils';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import type { PaymentInquiry } from '../../../types/2c2p';
import { ResponseCode } from '../../../modules/payment/2c2p/types';

interface PaymentDTOCustom extends PaymentDTO {
	data: {
		payment_token_result: {
			webPaymentUrl: string;
		};
	};
}

const _2c2pHttpClient = axios.create({
	baseURL: process.env.PAYMENT_2C2P_API_URL,
});

const paymentInquiry = async (
	invoiceNo: string,
	orderId: string,
	logger: Logger,
) => {
	const merchantID = process.env.PAYMENT_2C2P_MERCHANT_ID;
	const secretKey = process.env.PAYMENT_2C2P_MERCHANT_SECRET_KEY;
	const payload = {
		merchantID,
		invoiceNo,
	};

	const encodedPayload = jwt.sign(payload, secretKey);
	const response = await _2c2pHttpClient.post<{ payload: string }>(
		'/payment/4.3/paymentInquiry',
		{
			payload: encodedPayload,
		},
	);

	const encodedResponse = response.data.payload;
	const resp = jwt.verify(encodedResponse, secretKey) as PaymentInquiry;

	logger.info(
		`Order:${orderId} Payment inquiry result (invoiceNo:${invoiceNo}): ${resp.respCode} - ${resp.respDesc}`,
	);

	return resp;
};

const mappingResponse = (paymentInquiry: PaymentInquiry) => {
	const { respCode } = paymentInquiry;
	const successCodes = [ResponseCode.SUCCESS, ResponseCode.SETTLED];
	if (successCodes.includes(respCode)) {
		return 'success';
	}

	const pendingCodes = [
		ResponseCode.TXT_IS_PENDING,
		ResponseCode.TXT_NOT_FOUND,
	];
	if (pendingCodes.includes(respCode)) {
		return 'pending';
	}

	if (respCode === ResponseCode.TXT_IS_CANCELLED) {
		return 'cancelled';
	}

	return 'failed';
};

export const _2c2pPaymentInquiryStep = createStep(
	'2c2p-payment-inquiry-step',
	async (input: PaymentInquiryInput, context) => {
		const { orderId } = input;
		const logger: Logger = context.container.resolve('logger');
		const orderService: IOrderModuleService = context.container.resolve(
			Modules.ORDER,
		);
		const paymentService: IPaymentModuleService = context.container.resolve(
			Modules.PAYMENT,
		);
		const order = await orderService.retrieveOrder(orderId);
		const paymentId = order.metadata?.payment_id as string;
		const payment = (await paymentService
			.listPayments(
				{
					id: paymentId,
				},
				{ take: 1, skip: 0 },
			)
			.then((res) => res[0] || null)) as PaymentDTOCustom;

		const webPaymentUrl = payment?.data?.payment_token_result?.webPaymentUrl;
		if (!webPaymentUrl) {
			const errorMsg = `Order: ${orderId} payment?.data?.payment_token_result?.webPaymentUrl not found`;
			logger.error(errorMsg);
			return new StepResponse({
				status: 'failed',
				message: errorMsg,
				orderId,
			});
		}

		const paymentInvoiceNo = order.metadata?.payment_invoice_no as string;
		if (!paymentInvoiceNo) {
			const errorMsg = `Order: ${orderId} metadata.payment_invoice_no not found`;
			logger.error(errorMsg);
			return new StepResponse({
				status: 'failed',
				message: errorMsg,
				orderId,
			});
		}

		try {
			const inquiry = await paymentInquiry(paymentInvoiceNo, orderId, logger);
			return new StepResponse({
				status: mappingResponse(inquiry),
				message: 'Payment inquiry',
				orderId,
				invoice_no: paymentInvoiceNo,
				inquiry_description: inquiry.respDesc,
			});
		} catch (e) {
			const errorMsg = `Order:${orderId} Error in payment inquiry: ${e.message}`;
			logger.error(errorMsg);
			return new StepResponse({
				status: 'failed',
				message: errorMsg,
				orderId,
				invoice_no: paymentInvoiceNo,
			});
		}
	},
);

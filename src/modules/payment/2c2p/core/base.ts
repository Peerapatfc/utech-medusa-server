import { EOL } from 'node:os';
import axios, { type AxiosInstance } from 'axios';
import BigNumber from 'bignumber.js';
import jwt from 'jsonwebtoken';

import type {
	AuthorizePaymentInput,
	AuthorizePaymentOutput,
	CancelPaymentInput,
	CancelPaymentOutput,
	CapturePaymentInput,
	CapturePaymentOutput,
	CreateAccountHolderInput,
	CreateAccountHolderOutput,
	DeleteAccountHolderInput,
	DeleteAccountHolderOutput,
	DeletePaymentInput,
	DeletePaymentOutput,
	GetPaymentStatusInput,
	GetPaymentStatusOutput,
	InitiatePaymentInput,
	InitiatePaymentOutput,
	ListPaymentMethodsInput,
	ListPaymentMethodsOutput,
	MedusaContainer,
	ProviderWebhookPayload,
	RefundPaymentInput,
	RefundPaymentOutput,
	RetrievePaymentInput,
	RetrievePaymentOutput,
	SavePaymentMethodInput,
	SavePaymentMethodOutput,
	UpdatePaymentInput,
	UpdatePaymentOutput,
	WebhookActionResult,
} from '@medusajs/types';
import {
	AbstractPaymentProvider,
	ContainerRegistrationKeys,
	PaymentSessionStatus,
} from '@medusajs/utils';
import {
	type PaymentIntentOptions,
	type PaymentTokenEncodedResponse,
	type PaymentTokenResponse,
	ResponseCode,
} from '../types';
import type { Logger } from '@medusajs/medusa';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

interface ConfigOptions {
	host: string;
	merchantId: string;
	secretKey: string;
}

abstract class Payment2C2PBase extends AbstractPaymentProvider {
	protected readonly options_: ConfigOptions;
	protected container_: MedusaContainer;
	protected _2c2pClient: AxiosInstance;
	protected logger: Logger;

	protected constructor(container: MedusaContainer, options: ConfigOptions) {
		// @ts-ignore
		// biome-ignore lint/style/noArguments: <explanation>
		super(...arguments);
		this.container_ = container;
		this.options_ = options;
		this._2c2pClient = this.init();

		// biome-ignore lint/complexity/useLiteralKeys: <explanation>
		this.logger = container['logger'];
	}

	protected init(): AxiosInstance {
		this.validateOptions(this.options_);
		return axios.create({
			baseURL: this.options_.host,
		});
	}

	abstract get paymentIntentOptions(): PaymentIntentOptions;

	private validateOptions(options: ConfigOptions): void {
		if (!options.host) {
			throw new Error('2C2P: Missing host in options');
		}

		if (!options.merchantId) {
			throw new Error('2C2P: Missing merchantId in options');
		}

		if (!options.secretKey) {
			throw new Error('2C2P: Missing secretKey in options');
		}
	}

	getPaymentIntentOptions(): PaymentIntentOptions {
		const options: PaymentIntentOptions = {};
		options.payment_channel = this.paymentIntentOptions.payment_channel;

		// can be used to set the payment method types
		return options;
	}

	// prepare payload for 2c2p
	async initiatePayment(
		input: InitiatePaymentInput,
	): Promise<InitiatePaymentOutput> {
		this.logger.info('starting initiatePayment');

		const { amount, currency_code, data, context } = input;
		const { account_holder, customer, idempotency_key } = context;

		const intentRequestData = this.getPaymentIntentOptions();
		const session_id = data?.session_id as string;

		const sessionData = {
			merchantID: this.options_.merchantId,
			invoiceNo: session_id,
			description: 'UTech Store',
			amount: amount,
			currencyCode: 'THB',
			paymentChannel: intentRequestData.payment_channel,
			payment_session_id: session_id,
		};

		this.logger.info('end initiatePayment');

		return {
			id: session_id,
			data: {
				...sessionData,
			},
		};
	}

	async updatePayment(input: UpdatePaymentInput): Promise<UpdatePaymentOutput> {
		const { context, data, amount } = input;

		this.logger.info('starting updatePayment');
		this.logger.info('end updatePayment');
		return {
			data: {
				...data,
				amount,
				context,
			},
		};
	}

	generateInvoiceNo(): string {
		const timestamp = new Date().getTime();
		const random = Math.floor(Math.random() * 100000);
		const invoiceNo = `${timestamp}${random}`.slice(0, 16);
		return invoiceNo;
	}

	async authorizePayment(
		input: AuthorizePaymentInput,
	): Promise<AuthorizePaymentOutput> {
		this.logger.info('starting authorizePayment');

		const { context, data: paymentSessionData } = input;
		const { account_holder, customer, idempotency_key } = context;

		paymentSessionData.invoiceNo = this.generateInvoiceNo();

		const backendReturnUrl = `${process.env.MEDUSA_BACKEND_URL}/hooks/payment/2c2p?token=mock-backend-token`;
		const frontendReturnUrl = `${process.env.MEDUSA_FRONTEND_URL}/api/callbacks/payment`;

		dayjs.extend(utc);
		dayjs.extend(timezone);
		dayjs.tz.setDefault('Asia/Bangkok');
		const expiryTime = dayjs()
			.add(30, 'minutes')
			.tz('Asia/Bangkok')
			.format('YYYY-MM-DD HH:mm:ss');

		const payload = {
			merchantID: paymentSessionData.merchantID,
			invoiceNo: paymentSessionData.invoiceNo,
			description: paymentSessionData.description,
			amount: Math.round(paymentSessionData.amount as number),
			currencyCode: paymentSessionData.currencyCode,
			paymentChannel: paymentSessionData.paymentChannel,

			// locale: 'en',
			frontendReturnUrl,
			backendReturnUrl,
			userDefined1: paymentSessionData?.payment_session_id || '',
			userDefined2: 'userDefined2',
			userDefined3: 'userDefined3',
			userDefined4: 'userDefined4',
			userDefined5: 'userDefined5',
			paymentExpiry: undefined,
		};
		if (
			Array.isArray(paymentSessionData?.paymentChannel) &&
			paymentSessionData.paymentChannel.includes('CC')
		) {
			payload.paymentExpiry = expiryTime;
			paymentSessionData.expiryTime = expiryTime;
		}

		this.logger.info(
			`[2c2p] authorizePayment, payload:${JSON.stringify(payload)}`,
		);

		const secretKey = this.options_.secretKey;

		const encodedPayload = jwt.sign(payload, secretKey);

		const paymentToken = await this._2c2pClient
			.post<PaymentTokenEncodedResponse>('/payment/4.3/paymentToken', {
				payload: encodedPayload,
			})
			.then((res) => {
				this.logger.info(
					`[2c2p] authorizePayment, 2c2p paymentToken response:${JSON.stringify(res?.data)}`,
				);

				// data: { respCode: '9058', respDesc: 'Invalid Request (9058)' }
				/* code: 9058 maybe can not create txn less then 3,000 with installment  */

				// if success, data will be { payload: '' }
				if (res.data?.payload) {
					return res.data.payload;
				}

				const error = new Error(
					`2c2p paymentToken error, respCode:${res.data.respCode}, respDesc:${res.data.respDesc}`,
				);
				return this.buildError('An error occurred in authorizePayment', error);
			})
			.catch((e) => {
				this.logger.error(
					`[2c2p] An error occurred in authorizePayment, 2c2p paymentToken error:${e.message}`,
					e,
				);
				return this.buildError('An error occurred in authorizePayment', e);
			});

		if (typeof paymentToken !== 'string') {
			return {
				status: PaymentSessionStatus.ERROR,
			};
		}

		const decodedPaymentToken = jwt.verify(
			paymentToken,
			secretKey,
		) as PaymentTokenResponse;
		if (decodedPaymentToken.respCode !== ResponseCode.SUCCESS) {
			const errMessage = `An error occurred in authorizePayment, 2c2p paymentToken error: ${decodedPaymentToken.respCode}, ${decodedPaymentToken.respDesc}`;
			this.logger.error(errMessage);
			return {
				status: PaymentSessionStatus.ERROR,
			};
		}

		const { status } = await this.getPaymentStatus(paymentSessionData);

		return {
			data: {
				...paymentSessionData,
				payment_token_result: decodedPaymentToken,
			},
			status,
		};
	}

	async getPaymentStatus(
		data: GetPaymentStatusInput,
	): Promise<GetPaymentStatusOutput> {
		return {
			status: PaymentSessionStatus.AUTHORIZED,
		};
	}

	async cancelPayment(input: CancelPaymentInput): Promise<CancelPaymentOutput> {
		const { data, context } = input;

		this.logger.info('starting cancelPayment');
		//TODO: implement cancel payment

		this.logger.info('end cancelPayment');

		return {
			data,
		};
	}

	async capturePayment(
		input: CapturePaymentInput,
	): Promise<CapturePaymentOutput> {
		const { data: paymentSessionData, context } = input;

		this.logger.info('starting capturePayment');
		//TODO: implement capture payment

		this.logger.info('end capturePayment');

		return {
			data: paymentSessionData,
		};
	}

	async deletePayment(data: DeletePaymentInput): Promise<DeletePaymentOutput> {
		// return await this.cancelPayment(paymentSessionData);

		return {
			data: data.data,
		};
	}

	async refundPayment(input: RefundPaymentInput): Promise<RefundPaymentOutput> {
		const { data: paymentSessionData } = input;
		const id = paymentSessionData.id as string;

		// try {
		// } catch (e) {
		// 	return this.buildError('An error occurred in refundPayment', e);
		// }

		return paymentSessionData;
	}

	async retrievePayment(
		input: RetrievePaymentInput,
	): Promise<RetrievePaymentOutput> {
		return {
			data: input.data,
		};
	}

	async listPaymentMethods(
		input: ListPaymentMethodsInput,
	): Promise<ListPaymentMethodsOutput> {
		return [];
	}

	async getWebhookActionAndData(
		webhookData: ProviderWebhookPayload['payload'],
	): Promise<WebhookActionResult> {
		const { data, rawData, headers } = webhookData;

		try {
			switch (data.event_type) {
				case 'authorized_amount':
					return {
						action: 'authorized',
						data: {
							session_id: (data.metadata as Record<string, unknown>)
								.session_id as string,
							amount: new BigNumber(data.amount as number),
						},
					};
				case 'success':
					return {
						action: 'captured',
						data: {
							session_id: (data.metadata as Record<string, unknown>)
								.session_id as string,
							amount: new BigNumber(data.amount as number),
						},
					};
				default:
					return {
						action: 'not_supported',
					};
			}
		} catch (e) {
			return {
				action: 'failed',
				data: {
					session_id: (data.metadata as Record<string, unknown>)
						.session_id as string,
					amount: new BigNumber(data.amount as number),
				},
			};
		}
	}

	async createAccountHolder(
		input: CreateAccountHolderInput,
	): Promise<CreateAccountHolderOutput> {
		const { context, data } = input;
		const { customer } = context;

		this.logger.info('starting createAccountHolder');

		this.logger.info(`customer data: ${JSON.stringify(customer)}`);

		this.logger.info('end createAccountHolder');

		return {
			id: customer.id,
			data: data,
		};
	}

	async deleteAccountHolder(
		input: DeleteAccountHolderInput,
	): Promise<DeleteAccountHolderOutput> {
		return {
			data: input.data,
		};
	}

	async savePaymentMethod(
		input: SavePaymentMethodInput,
	): Promise<SavePaymentMethodOutput> {
		const { context, data } = input;

		return {
			id: data.id as string,
			data: data,
		};
	}

	protected buildError(message: string, error: Error) {
		const errorDetails = error as unknown as {
			code?: string;
			detail?: string;
		};

		return {
			error: `${message}: ${error.message}`,
			code: 'code' in errorDetails ? errorDetails.code : 'unknown',
			detail:
				'detail' in errorDetails
					? `${error.message}: ${errorDetails.detail}`
					: error.message,
		};
	}
}

export default Payment2C2PBase;

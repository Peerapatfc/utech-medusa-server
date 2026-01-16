import { createStep, StepResponse } from '@medusajs/framework/workflows-sdk';
import type { DynamicContent, Content } from 'pdfmake/interfaces';
import type { GetInvoiceContentInput } from '../type';
import { getPaymentName } from '../../../../utils/payment-method';
import { formatPriceWithDecimal } from '../../../../utils/prices';

const getInvoiceFooterStep = createStep(
	'get-invoice-footer',
	async ({ order }: GetInvoiceContentInput, context) => {
		const { payment_collections, shipping_methods, shipping_total, metadata } =
			order;
		const payment = payment_collections?.[0]?.payments?.[0] || null;
		const providerId = payment?.provider_id || null;
		const paymentMethod = getPaymentName(providerId);

		const shippingMethod = shipping_methods?.[0]?.name || '';

		const shippingTotal = formatPriceWithDecimal(shipping_total as number);

		const data = {
			paymentMethod: `${paymentMethod} (ชำระเต็มจำนวน)`,
			shippingMethod: `${shippingMethod} (Fixed Rate)`,
			shippingTotal,
		};

		if (
			metadata?.is_pre_order &&
			metadata?.pickup_option?.slug === 'in-store-pickup'
		) {
			data.paymentMethod = `${paymentMethod} (ชำระล่วงหน้า)`;
		}

		const invoiceFooter: DynamicContent | Content | undefined = {
			margin: [40, 0, 40, 0],
			stack: [
				{
					canvas: [
						{
							type: 'line',
							x1: 0,
							y1: 0,
							x2: 515,
							y2: 0,
							lineWidth: 1,
						},
					],
				},
				{
					layout: 'noBorders',
					margin: [0, 10, 0, 0],
					table: {
						widths: ['*', 'auto'],
						body: [
							[
								{ text: 'Payment Method', bold: true },
								{ text: 'Shipping Method', bold: true },
							],
							[data.paymentMethod, data.shippingMethod],
							['', `(Total Shipping Charges: THB ${shippingTotal})`],
						],
					},
				},
			],
		};

		return new StepResponse({
			footer: invoiceFooter,
		});
	},
);

export default getInvoiceFooterStep;

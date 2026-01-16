import { createStep, StepResponse } from '@medusajs/framework/workflows-sdk';
import path from 'node:path';
import type { GetInvoiceContentInput } from '../type';
import type { IOrderModuleService } from '@medusajs/framework/types';
import {
	type CustomStoreCustomerAddress,
	AddressType,
	TaxInvoiceType,
} from '../../../../types/address';
import { Modules } from '@medusajs/framework/utils';
import { getBuddhistDate } from '../../../../utils/date';

const getInvoiceHeaderStep = createStep(
	'get-invoice-header',
	async ({ order }: GetInvoiceContentInput, context) => {
		const logoPath = path.resolve(
			__dirname,
			'../../../../assets/images/utech-logo.png',
		);

		const orderSerive: IOrderModuleService = context.container.resolve(
			Modules.ORDER,
		);

		const { payment_collections, metadata } = order;

		const orderNo = metadata?.order_no || '';
		const invoiceNo = metadata?.invoice_no || '';
		const payment = payment_collections?.[0]?.payments?.[0] || null;
		const capturedAt = payment?.captured_at;
		const capturedDate = capturedAt ? getBuddhistDate(capturedAt) : '-';

		const billingAddress = order?.billing_address;
		const shippingAddress = order?.shipping_address;

		const taxInvoiceAddress = metadata?.tax_invoice_address_id
			? await orderSerive
					.listOrderAddresses({
						id: metadata?.tax_invoice_address_id,
					})
					.then((res) => res[0])
			: null;

		const customerAddressData = (() => {
			if (taxInvoiceAddress?.province) {
				return taxInvoiceAddress;
			}

			if (billingAddress?.province) {
				return billingAddress;
			}

			if (shippingAddress?.province) {
				return shippingAddress;
			}

			return null;
		})();

		const textHeaderTh = taxInvoiceAddress
			? 'ใบเสร็จรับเงิน/ใบกำกับภาษี'
			: 'ใบเสร็จรับเงิน';
		const textHeaderEn = taxInvoiceAddress ? 'Receipt/Tax Invoice' : 'Receipt';

		const customerAddress = generateCustomerAddress({
			address: customerAddressData as CustomStoreCustomerAddress,
			orderNo,
			invoiceNo,
			capturedDate,
		});

		const invoiceHeader = [
			// row 1....
			[
				{
					image: logoPath,
					width: 90,
					height: 17,
				},
				{
					text: textHeaderTh,
					fontSize: 20,
					alignment: 'right',
				},
			],
			// row 2....
			[
				{
					text: [
						'บริษัท ยู เทค อินโนเวชัน จำกัด\n',
						'343/37-38 ถนนคลองลำเจียก แขวงนวลจันทร์\n',
						'เขตบึงกุ่ม กรุงเทพมหานคร 10240\n',
						'เลขประจำตัวผู้เสียภาษี 0105565053292',
					],
				},
				{
					text: textHeaderEn,
					alignment: 'right',
					fontSize: 14,
				},
			],
			// row 3....
			...customerAddress,
		];

		return new StepResponse({
			header: invoiceHeader,
		});
	},
);

export default getInvoiceHeaderStep;

const generateCustomerAddress = ({
	address,
	orderNo,
	invoiceNo,
	capturedDate,
}: {
	address: CustomStoreCustomerAddress;
	orderNo: string;
	invoiceNo: string;
	capturedDate: string;
}) => {
	const customerAddressMap = {
		name: `${address?.first_name || ''} ${address?.last_name || ''}`,
		address_line1: `${address?.address_1 || ''} ${address?.metadata?.sub_district || ''} ${address?.city || ''} ${address?.province || ''} ${address?.postal_code || ''}`,
		tel: address?.phone || '',
		email: address?.metadata?.email || '',
		tax_id: address?.metadata?.juristic_no || '',
	};

	const isTexAddress =
		address?.metadata?.address_type === AddressType.TaxInvoice;
	const isJuristicAddress =
		address?.metadata?.tax_invoice_type === TaxInvoiceType.Juristic;

	if (isTexAddress && isJuristicAddress) {
		customerAddressMap.name = address?.metadata?.juristic_name || '';

		if (address?.metadata?.branch_name) {
			customerAddressMap.name = `${customerAddressMap.name} (${address?.metadata?.branch_name})`;
		}
	}

	return [
		[
			{
				margin: [0, 10, 0, 0],
				text: [
					{
						text: 'ลูกค้า : ',
						bold: true,
					},
					`${customerAddressMap.name}\n`,
					{
						text: 'ที่อยู่ : ',
						bold: true,
					},
					{
						text: `${customerAddressMap.address_line1}\n`,
					},
					{
						text: 'โทร : ',
						bold: true,
					},
					`${customerAddressMap.tel}\n`,
					{
						text: 'อีเมล : ',
						bold: true,
					},
					`${customerAddressMap.email}\n`,
					{
						text: 'เลขประจำตัวผู้เสียภาษี : ',
						bold: true,
					},
					`${customerAddressMap.tax_id}\n`,
				],
			},
			{
				text: [
					`Invoice #${invoiceNo}\n`,
					`Order #${orderNo}\n`,
					`วันที่ ${capturedDate}\n`,
				],
				alignment: 'right',
				fontSize: 12,
			},
		],
	];
};

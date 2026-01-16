import { createStep, StepResponse } from '@medusajs/framework/workflows-sdk';
import type { Content } from 'pdfmake/interfaces';
import type { OrderLineItemDTO } from '@medusajs/framework/types';
import type { CustomOrderDetailDTO, GetInvoiceContentInput } from '../type';
import { formatPriceWithDecimal } from '../../../../utils/prices';

const getInvoiceContentStep = createStep(
	'get-invoice-content',
	async ({ order, discountTemplate }: GetInvoiceContentInput) => {
		const items = generateItemsTable(order?.items);
		const summary = generateSummary(order, discountTemplate);

		const invoiceContent: Content = [
			{
				style: 'productTable',
				table: {
					widths: [40, 100, 200, 'auto', '*', '*'],
					body: [
						[
							{ text: 'No.', bold: true, alignment: 'center' },
							{ text: 'SKU', bold: true, alignment: 'center' },
							{ text: 'Product', bold: true, alignment: 'center' },
							{ text: 'Qty', bold: true, alignment: 'center' },
							{ text: 'Price', bold: true, alignment: 'center' },
							{ text: 'Subtotal', bold: true, alignment: 'center' },
						],
						...items,
					],
				},
			},
			{
				layout: 'noBorders',
				table: {
					widths: ['*', 'auto'],
					body: summary,
				},
			},
		];

		return new StepResponse({
			content: invoiceContent,
		});
	},
);

export default getInvoiceContentStep;

const generateItemsTable = (items: OrderLineItemDTO[]) => {
	const result = [];
	let rowNumber = 1;
	for (const item of items) {
		const { title, quantity, unit_price, variant_sku, metadata, subtotal } =
			item;
		const serialNumber = metadata?.serial_number || '';

		result.push([
			{
				text: `${rowNumber}`,
				alignment: 'center',
				margin: [0, 5, 0, 5],
			},
			{
				text: variant_sku,
				margin: [0, 5, 0, 5],
			},
			{
				text: [
					{
						text: `${title}\n`,
					},
					{
						text: `Serial No. ${serialNumber}\n`,
						fontSize: 10,
						color: '#666',
					},
				],
			},
			{
				text: `${quantity}`,
				alignment: 'center',
				margin: [0, 5, 0, 5],
			},
			{
				text: formatPriceWithDecimal(unit_price),
				alignment: 'center',
				margin: [0, 5, 0, 5],
			},
			{
				text: formatPriceWithDecimal(subtotal as number),
				alignment: 'center',
				margin: [0, 5, 0, 5],
			},
		]);

		rowNumber++;
	}

	return result;
};

const generateSummary = (
	order: CustomOrderDetailDTO,
	discountTemplate: string,
) => {
	const { total, discount_total, shipping_total, item_subtotal } = order;

	const itemSubtotal = formatPriceWithDecimal(item_subtotal as number);
	const discount = formatPriceWithDecimal(discount_total as number);
	const shippingTotal = formatPriceWithDecimal(shipping_total as number);
	const orderTotal = formatPriceWithDecimal(total as number);

	const result = [
		[
			{
				text: 'Subtotal',
				alignment: 'right',
			},
			{
				text: `THB ${itemSubtotal}`,
				alignment: 'right',
			},
		],
		[
			{
				text: 'Total Shipping Charges',
				alignment: 'right',
			},
			{
				text: `THB ${shippingTotal}`,
				alignment: 'right',
			},
		],
		[
			{
				text: 'Grand Total',
				bold: true,
				alignment: 'right',
			},
			{
				text: `THB ${orderTotal}`,
				bold: true,
				alignment: 'right',
			},
		],
	];

	const discountSection = [
		{
			text: discountTemplate,
			alignment: 'right',
		},
		{
			text: `-THB ${discount}`,
			alignment: 'right',
		},
	];

	// add discount section to index 1  if discount is not 0
	if (discount_total !== 0) {
		result.splice(1, 0, discountSection);
	}

	return result;
};

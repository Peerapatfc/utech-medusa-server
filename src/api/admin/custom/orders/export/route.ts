import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import type { AdminOrder } from '@medusajs/framework/types';
import { Modules } from '@medusajs/framework/utils';
import { getOrdersListWorkflow } from '@medusajs/medusa/core-flows';
import type { PaymentCollectionDTO } from '@medusajs/types';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import * as XLSX from 'xlsx';
import type { PreOrderDetail } from '../../../../../types/pre-order';
import { getPaymentName } from '../../../../../utils/payment-method';
import { getFormattedAddressForExport } from '../../../../../utils/address';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Bangkok');

export async function POST(
	req: MedusaRequest,
	res: MedusaResponse,
): Promise<void> {
	const notificationService = req.scope.resolve(Modules.NOTIFICATION);

	const workflow = getOrdersListWorkflow(req.scope);
	const { result } = (await workflow.run({
		input: {
			fields: [
				'*',
				'shipping_address.*',
				'shipping_methods.*',
				'payment_collections.*',
				'payment_collections.payments.*',
			],
			variables: {
				filters: {
					$or: [
						{
							metadata: {
								is_pre_order: true,
							},
							//id: "order_01JFCDRDFKYDCSH9FR5GVP2XTS",
						},
					],
				},
			},
		},
	})) as unknown as { result: AdminOrder[] };

	const ordersData = result.map((orders) => {
		const order = orders;
		const payment_collection =
			orders.payment_collections as unknown as PaymentCollectionDTO;
		const order_metadata = {
			metadata: order?.metadata,
		} as PreOrderDetail;

		let products = '';
		if (order?.metadata?.is_pre_order) {
			products = order?.items
				?.map((item) => {
					if (item.product_type?.toLowerCase() === 'pre-order') {
						return `${item.quantity} x [${item.variant_sku || item.variant_title}] ${item.product_title}`;
					}
					return null;
				})
				.filter(Boolean)
				.join(';');
		} else {
			products = order?.items
				?.map((item) => {
					return `${item.quantity} x [${item.variant_sku || item.variant_title}] ${item.product_title}`;
				})
				.join(';');
		}

		let premium = '';
		if (order?.metadata?.is_pre_order) {
			premium = order?.items
				?.filter((item) => item?.metadata?.type === 'premium')
				.sort((a, b) =>
					(a.variant_sku || a.variant_title).localeCompare(
						b.variant_sku || b.variant_title,
					),
				)
				.map((item) => {
					return `${item.quantity} x [${item.variant_sku || item.variant_title}] ${item.product_title}`;
				})
				.join(';');
		}

		let bundle = '';
		if (order?.metadata?.is_pre_order) {
			bundle = order?.items
				?.filter((item) => item?.metadata?.type === 'bundle')
				.sort((a, b) =>
					(a.variant_sku || a.variant_title).localeCompare(
						b.variant_sku || b.variant_title,
					),
				)
				.map((item) => {
					return `${item.quantity} x [${item.variant_sku || item.variant_title}] ${item.product_title}`;
				})
				.join(';');
		}

		return {
			order_no: order?.metadata?.order_no ?? order.id,
			purchase_date: dayjs(order?.created_at)
				.tz('Asia/Bangkok')
				.format('DD MMM YYYY HH:mm:ss'),
			customer_name: `${order?.shipping_address?.first_name || ''} ${order?.shipping_address?.last_name || ''}`,
			email: order?.email,
			tel_no: order?.shipping_address?.phone || '',
			shipping_address: getFormattedAddressForExport({
				address: order?.shipping_address,
			}).join(' '),
			product: products,
			premium: premium,
			bundle: bundle,
			preorder_code: order_metadata?.metadata?.pre_order?.code || '',
			image_preview: order_metadata?.metadata?.pre_order?.code_image_url || '',
			price: Number(order?.payment_collections?.[0]?.amount).toFixed(2),
			payment_method:
				getPaymentName(
					order?.payment_collections?.[0]?.payments?.[0]?.provider_id,
				) || '',
			payment_status: order?.payment_status || '',
			shipping_method: order?.shipping_methods?.[0]?.name || '',
		};
	});

	const worksheet = XLSX.utils.json_to_sheet(ordersData);
	const workbook = XLSX.utils.book_new();
	XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');

	const excelBuffer = XLSX.write(workbook, {
		type: 'buffer',
		bookType: 'xlsx',
	});

	const fileModule = req.scope.resolve(Modules.FILE);
	const filename = `${Date.now()}-orders-export.xlsx`;
	const file = await fileModule.createFiles({
		filename,
		mimeType:
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
		content: excelBuffer,
	});

	await notificationService.createNotifications({
		to: 'admin',
		channel: 'feed',
		template: 'admin-ui',
		data: {
			title: 'Order export',
			description: `Orders export completed with ${ordersData.length} orders`,
			file: {
				filename: filename,
				url: file.url,
				mimeType:
					'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
			},
		},
	});

	res.setHeader(
		'Content-Type',
		'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
	);
	res.setHeader(
		'Content-Disposition',
		'attachment; filename=orders-export.xlsx',
	);

	res.send(excelBuffer);
}

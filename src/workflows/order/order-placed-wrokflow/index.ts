import {
	createWorkflow,
	parallelize,
	transform,
	when,
	WorkflowResponse,
} from '@medusajs/framework/workflows-sdk';
import createOrderTaxInvoiceAddressStep from './steps/create-tax-invoice-address-step';
import { useQueryStep } from '../../common';
import generateRunningNoWorkflow from '../generate-running-no';
import { RunningNumberConfigType } from '../../../types/running-number-config';
import updateOrderMetadataStep from './steps/update-order-metadata.step';
import { getOrderDetailWorkflow } from '@medusajs/medusa/core-flows';
import { defaultAdminOrderFields } from '../../../utils/query-configs/order';
import sendEmailStep from './steps/send-email-step';
import updateFlashSaleStockStep from './steps/update-flash-sale-stock-step';
import getCurrentFlashSaleStep from '../../common/steps/get-current-flash-sale-step';
import inventoryQuantityLogsStep from '../../common/steps/inventory-quantity-logs.step';
import updateProductSearchMetadataWorkflow from '../../product/update-product-search-metadata';
import revalidateStoreTagsStep from '../../common/steps/revalidate-store-tags-step';
import { updateCustomerAddressBookFromOrderWorkflow } from '../../customer/update-address-book-workflow';

export type OrderPlacedWorkflowInput = {
	id: string;
};

export const THREE_DAYS = 60 * 60 * 24 * 3;
export const orderPlacedWorkflowId = 'order-placed-workflow';

const orderPlacedWorkflow = createWorkflow(
	{
		name: orderPlacedWorkflowId,
		store: true,
		idempotent: true,
		retentionTime: THREE_DAYS,
	},
	(input: OrderPlacedWorkflowInput) => {
		// step 1: get order cart
		const orderCart = useQueryStep({
			entity: 'order_cart',
			fields: [
				'cart_id',
				'order_id',
				'cart.*',
				'order.*',
				'order.payment_collections.*',
			],
			filters: { order_id: input.id },
		});

		const { cart, order, payment_collection } = transform(
			{ orderCart },
			({ orderCart }) => {
				const latestPaymentCollection =
					orderCart.data[0]?.order?.payment_collections?.sort((a, b) => {
						return (
							new Date(b.created_at).getTime() -
							new Date(a.created_at).getTime()
						);
					});
				return {
					cart: orderCart.data[0]?.cart,
					order: orderCart.data[0]?.order,
					payment_collection: latestPaymentCollection?.[0] || null,
				};
			},
		);

		// step 2: generate order no
		const { generatedNo: generatedOrderNo } =
			generateRunningNoWorkflow.runAsStep({
				input: {
					type: RunningNumberConfigType.ORDER_NO,
				},
			});

		// step 3: update order metadata
		const { payment_expiration } = updateOrderMetadataStep({
			order,
			cart,
			generatedOrderNo,
			payment_collection,
		});

		// step 4: create order tax invoice address
		createOrderTaxInvoiceAddressStep({
			order,
			cart,
		});

		// step 5: get fresh order detail
		const freshOrderDetail = getOrderDetailWorkflow.runAsStep({
			input: {
				fields: defaultAdminOrderFields,
				order_id: input.id,
			},
		});

		const currentFlashSale = getCurrentFlashSaleStep();
		when(currentFlashSale, (currentFlashSale) => {
			return !!currentFlashSale;
		}).then(() => {
			updateFlashSaleStockStep({
				currentFlashSale,
				orderDetail: freshOrderDetail,
				type: 'order-placed',
			});
		});

		const productIds = transform(
			{ freshOrderDetail },
			({ freshOrderDetail }) => {
				return freshOrderDetail?.items.map((item) => item.product_id);
			},
		);

		// step 6: send email and update inventory
		parallelize(
			sendEmailStep({
				// @ts-ignore
				orderDetail: freshOrderDetail,
				orderNo: generatedOrderNo,
				paymentExpiration: payment_expiration,
			}),
			inventoryQuantityLogsStep({
				orderDetail: freshOrderDetail,
				action: 'reserved',
			}),
		);

		updateProductSearchMetadataWorkflow.runAsStep({
			input: {
				productId: productIds,
			},
		});

		updateCustomerAddressBookFromOrderWorkflow.runAsStep({
			input: {
				orderId: input.id,
			},
		});

		revalidateStoreTagsStep({
			tags: ['products', 'custom-products', 'flash-sales'],
		});

		return new WorkflowResponse({
			generatedOrderNo,
		});
	},
);

export default orderPlacedWorkflow;

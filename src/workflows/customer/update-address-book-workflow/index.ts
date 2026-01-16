import { AdminCustomerAddress } from '@medusajs/framework/types';
import {
	createWorkflow,
	transform,
	when,
	WorkflowResponse,
} from '@medusajs/framework/workflows-sdk';
import { useQueryGraphStep } from '@medusajs/medusa/core-flows';
import { updateShippingAddressFromOrderStep } from './steps/update-shipping-address-from-order-step';
import { updateBillingAddressFromOrderStep } from './steps/update-billing-address-from-order-step';
import { updateTaxInvoiceAddressFromOrderStep } from './steps/update-tax-invoice-address-from-order-step';

type WorkflowInput = {
	orderId: string;
};

export const updateCustomerAddressBookFromOrderWorkflow = createWorkflow(
	'update-customer-address-book-from-order-workflow',
	(input: WorkflowInput) => {
		const { data: orders } = useQueryGraphStep({
			entity: 'order',
			fields: [
				'id',
				'metadata',
				'billing_address.*',
				'shipping_address.*',
				'customer.has_account',
				'customer.addresses.*',
			],
			filters: { id: input.orderId },
		});

		const customerAddresses = transform({ orders }, (data) => {
			return (
				(data.orders[0]?.customer?.addresses as AdminCustomerAddress[]) || []
			);
		});

		when(orders, (orders) => {
			return !!orders[0]?.shipping_address && orders[0]?.customer?.has_account;
		}).then(() => {
			updateShippingAddressFromOrderStep({
				order_shipping_address: orders[0].shipping_address,
				customer_id: orders[0].customer_id,
				customer_addresses: customerAddresses,
			});
		});

		when(orders, (orders) => {
			return !!orders[0]?.billing_address && orders[0]?.customer?.has_account;
		}).then(() => {
			updateBillingAddressFromOrderStep({
				order_billing_address: orders[0].billing_address,
				customer_id: orders[0].customer_id,
				customer_addresses: customerAddresses,
			});
		});

		when(orders, (orders) => {
			return (
				!!orders[0]?.metadata?.tax_invoice_address_id &&
				orders[0]?.customer?.has_account
			);
		}).then(() => {
			updateTaxInvoiceAddressFromOrderStep({
				order_tax_invoice_address_id: orders[0].metadata
					?.tax_invoice_address_id as string,
				customer_id: orders[0].customer_id,
				customer_addresses: customerAddresses,
			});
		});

		return new WorkflowResponse({
			orders,
		});
	},
);

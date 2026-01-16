import { AdminCustomerAddress } from '@medusajs/framework/types';
import { Modules } from '@medusajs/framework/utils';
import { createStep, StepResponse } from '@medusajs/framework/workflows-sdk';
import { checkCustomerAddressExists } from '../util';

export const updateTaxInvoiceAddressFromOrderStep = createStep(
	'update-tax-invoice-address-from-order-step',
	async (
		input: {
			order_tax_invoice_address_id: string;
			customer_id: string;
			customer_addresses: AdminCustomerAddress[];
		},
		{ container },
	) => {
		const orderService = container.resolve(Modules.ORDER);
		const orderTaxInvoiceAddress = await orderService
			.listOrderAddresses({
				id: input.order_tax_invoice_address_id,
			})
			.then((res) => res[0]);

		if (!orderTaxInvoiceAddress) {
			return new StepResponse(
				{},
				{
					created_id: null,
				},
			);
		}

		const customerAddresses = input.customer_addresses;
		const customerTaxInvoiceAddress = customerAddresses.filter(
			(address) => address.metadata?.address_type === 'tax_invoice',
		);

		const isAddressExists = checkCustomerAddressExists(
			customerTaxInvoiceAddress,
			orderTaxInvoiceAddress,
		);

		if (isAddressExists) {
			return new StepResponse(
				{},
				{
					created_id: null,
				},
			);
		}

		const customerService = container.resolve(Modules.CUSTOMER);
		const createdAddress = await customerService.createCustomerAddresses({
			address_name: '',
			is_default_shipping: false,
			is_default_billing: false,
			customer_id: input.customer_id,
			company: orderTaxInvoiceAddress.company,
			first_name: orderTaxInvoiceAddress.first_name,
			last_name: orderTaxInvoiceAddress.last_name,
			address_1: orderTaxInvoiceAddress.address_1,
			address_2: orderTaxInvoiceAddress.address_2,
			city: orderTaxInvoiceAddress.city,
			country_code: orderTaxInvoiceAddress.country_code,
			province: orderTaxInvoiceAddress.province,
			postal_code: orderTaxInvoiceAddress.postal_code,
			phone: orderTaxInvoiceAddress.phone,
			metadata: {
				...(orderTaxInvoiceAddress.metadata || {}),
				is_default_tax_invoice: customerTaxInvoiceAddress.length === 0,
				address_type: 'tax_invoice',
			},
		});

		return new StepResponse(createdAddress, {
			created_id: createdAddress.id,
		});
	},
	async ({ created_id }: { created_id: string | null }, { container }) => {
		if (!created_id) return;

		const customerService = container.resolve(Modules.CUSTOMER);
		await customerService.deleteCustomerAddresses(created_id);
	},
);

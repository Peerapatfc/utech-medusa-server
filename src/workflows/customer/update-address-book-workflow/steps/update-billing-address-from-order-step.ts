import { AdminCustomerAddress, OrderAddress } from '@medusajs/framework/types';
import { Modules } from '@medusajs/framework/utils';
import { createStep, StepResponse } from '@medusajs/framework/workflows-sdk';
import { checkCustomerAddressExists } from '../util';

export const updateBillingAddressFromOrderStep = createStep(
	'update-billing-address-from-order-step',
	async (
		input: {
			order_billing_address: OrderAddress;
			customer_id: string;
			customer_addresses: AdminCustomerAddress[];
		},
		{ container },
	) => {
		const orderBillingAddress = input.order_billing_address;
		const customerAddresses = input.customer_addresses;
		const customerBillingAddresses = customerAddresses.filter(
			(address) => address.metadata?.address_type === 'billing',
		);

		const isAddressExists = checkCustomerAddressExists(
			customerBillingAddresses,
			orderBillingAddress,
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
			is_default_billing: customerBillingAddresses.length === 0,
			customer_id: input.customer_id,
			company: orderBillingAddress.company,
			first_name: orderBillingAddress.first_name,
			last_name: orderBillingAddress.last_name,
			address_1: orderBillingAddress.address_1,
			address_2: orderBillingAddress.address_2,
			city: orderBillingAddress.city,
			country_code: orderBillingAddress.country_code,
			province: orderBillingAddress.province,
			postal_code: orderBillingAddress.postal_code,
			phone: orderBillingAddress.phone,
			metadata: {
				...(orderBillingAddress.metadata || {}),
				address_type: 'billing',
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

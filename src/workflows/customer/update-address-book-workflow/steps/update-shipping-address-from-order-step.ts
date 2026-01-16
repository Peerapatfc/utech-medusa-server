import { AdminCustomerAddress, OrderAddress } from '@medusajs/framework/types';
import { Modules } from '@medusajs/framework/utils';
import { createStep, StepResponse } from '@medusajs/framework/workflows-sdk';
import { checkCustomerAddressExists } from '../util';

export const updateShippingAddressFromOrderStep = createStep(
	'update-shipping-address-from-order-step',
	async (
		input: {
			order_shipping_address: OrderAddress;
			customer_id: string;
			customer_addresses: AdminCustomerAddress[];
		},
		{ container },
	) => {
		const orderShippingAddress = input.order_shipping_address;
		const customerAddresses = input.customer_addresses;
		const customerShippingAddresses = customerAddresses.filter(
			(address) => address.metadata?.address_type === 'shipping',
		);

		const isAddressExists = checkCustomerAddressExists(
			customerShippingAddresses,
			orderShippingAddress,
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
			is_default_shipping: customerShippingAddresses.length === 0,
			is_default_billing: false,
			customer_id: input.customer_id,
			company: orderShippingAddress.company,
			first_name: orderShippingAddress.first_name,
			last_name: orderShippingAddress.last_name,
			address_1: orderShippingAddress.address_1,
			address_2: orderShippingAddress.address_2,
			city: orderShippingAddress.city,
			country_code: orderShippingAddress.country_code,
			province: orderShippingAddress.province,
			postal_code: orderShippingAddress.postal_code,
			phone: orderShippingAddress.phone,
			metadata: {
				...(orderShippingAddress.metadata || {}),
				address_type: 'shipping',
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

import type { MedusaRequest, MedusaResponse } from '@medusajs/framework';
import type {
	ICartModuleService,
	StoreAddAddress,
	UpdateAddressDTO,
} from '@medusajs/framework/types';
import { Modules } from '@medusajs/framework/utils';

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
	const { id } = req.params;
	const cartService: ICartModuleService = req.scope.resolve(Modules.CART);
	const cart = await cartService.retrieveCart(id);

	const cartTaxInvoiceAddressId = cart.metadata
		?.tax_invoice_address_id as string;
	if (!cartTaxInvoiceAddressId) {
		return res.status(404).json({
			tax_invoice_address: null,
		});
	}

	const taxInvoiceAddress = await cartService
		.listAddresses(
			{
				id: cartTaxInvoiceAddressId,
			},
			{
				take: 1,
				skip: 0,
			},
		)
		.then((addresses) => addresses[0]);

	res.status(200).json({
		tax_invoice_address: taxInvoiceAddress,
	});
};

export const POST = async (
	req: MedusaRequest<UpdateAddressDTO>,
	res: MedusaResponse,
) => {
	const { id } = req.params;
	const payload = req.body;
	if (!payload?.metadata?.cart_id) {
		payload.metadata = {
			...payload.metadata,
			cart_id: id,
		};
	}

	const cartService: ICartModuleService = req.scope.resolve(Modules.CART);

	if (payload.id) {
		const updated = await cartService.updateAddresses(payload);
		return res.status(200).json(updated);
	}

	const created = await cartService.createAddresses(payload);
	res.status(201).json(created);
};

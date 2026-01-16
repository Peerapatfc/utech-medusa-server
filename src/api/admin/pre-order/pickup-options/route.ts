import type { PickupOption } from '@customTypes/pre-order';
import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { PRE_ORDER_SERVICE } from '../../../../modules/pre-order';
import type PreOrderService from '../../../../modules/pre-order/service';

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
	const preOrderService: PreOrderService = req.scope.resolve(PRE_ORDER_SERVICE);
	const pickupOptions = await preOrderService.listPickupOptions(
		{},
		{
			order: {
				rank: 'asc',
			},
		},
	);

	res.status(200).json({
		pickup_options: pickupOptions,
	});
};

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
	const preOrderService: PreOrderService = req.scope.resolve(PRE_ORDER_SERVICE);

	const seedDatas = [
		{
			name_th: 'จัดส่งที่บ้าน',
			name_en: 'Home Delivery',
			slug: 'home-delivery',
			is_upfront_payment: false,
			is_enabled_shipping: true,
			is_overide_unit_price: false,
			upfront_price: 0,
			shipping_start_date: null,
			pickup_start_date: null,
			rank: 1,
		},
		{
			name_th: 'รับสินค้าที่ร้าน',
			name_en: 'In-Store Pickup',
			slug: 'in-store-pickup',
			is_upfront_payment: true,
			is_enabled_shipping: false,
			is_overide_unit_price: true,
			upfront_price: 5000,
			shipping_start_date: null,
			pickup_start_date: null,
			rank: 2,
		},
	];

	for await (const seedData of seedDatas) {
		const existingPickupOption = await preOrderService
			.listPickupOptions({
				slug: seedData.slug,
			})
			.then((res) => res[0]);
		if (existingPickupOption) continue;

		await preOrderService.createPickupOptions(seedData);
	}

	// await preOrderService.createPreOrderTemplates({
	// 	name_th: 'Samsung Galaxy S25 Series',
	// });

	res.status(201).json({ success: true });
};

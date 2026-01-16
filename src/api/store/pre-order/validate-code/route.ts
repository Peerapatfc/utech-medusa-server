import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import type { CartDTO, OrderDTO } from '@medusajs/framework/types';
import {
	ContainerRegistrationKeys,
	OrderStatus,
} from '@medusajs/framework/utils';

export const POST = async (
	req: MedusaRequest<{ code: string; cart_id: string }>,
	res: MedusaResponse,
) => {
	const { code, cart_id } = req.body;
	let isAvailable = true;
	try {
		const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
		//@ts-ignore
		const { data: carts } = (await query.graph({
			entity: 'cart',
			fields: ['*', 'order.*'],
			filters: {
				id: {
					$ne: cart_id,
				},
				metadata: {
					pre_order: {
						code,
					},
				},
			},
			pagination: {
				take: 100,
				skip: 0,
			},
		})) as unknown as { data: (CartDTO & { order: OrderDTO })[] };

		// if (carts.length === 0) {
		// 	res.status(200).json({
		// 		is_available: true,
		// 		message: 'This code is available',
		// 	});
		// 	return;
		// }

		for (const cart of carts) {
			const { order } = cart;
			// if (!order) {
			// 	isAvailable = false;
			// 	break;
			// }

			if (!order) continue;

			const { status } = order;
			const isCancelledOrder = status === OrderStatus.CANCELED;
			if (!isCancelledOrder) {
				isAvailable = false;
				break;
			}
		}

		res.status(200).json({
			is_available: isAvailable,
			message: isAvailable
				? 'This code is available'
				: 'This code is not available',
		});
	} catch (error) {
		res.status(500).json({
			is_available: false,
			message: error.message,
		});
	}
};

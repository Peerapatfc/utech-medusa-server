import type {
	AdminOrder,
	IOrderModuleService,
	MedusaContainer,
} from '@medusajs/framework/types';
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils';

export const getOrderById = (container: MedusaContainer, id: string) => {
	const orderService: IOrderModuleService = container.resolve(Modules.ORDER);
	return orderService.retrieveOrder(id, {
		select: ['id', 'metadata'],
	});
};

export const getOrderByPaymentId = async (
	container: MedusaContainer,
	id: string,
) => {
	const query = container.resolve(ContainerRegistrationKeys.QUERY);
	const {
		data: [payment],
	} = (await query.graph({
		entity: 'payment',
		filters: {
			id,
		},
		fields: [
			'id',
			'payment_collection.id',
			'payment_collection.order.metadata',
		],
	})) as unknown as { data: { payment_collection: { order: AdminOrder } }[] };

	return payment?.payment_collection?.order;
};

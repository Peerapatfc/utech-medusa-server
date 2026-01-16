import { createProductsWorkflow } from '@medusajs/medusa/core-flows';
import { ADMIN_MODULE } from '../../../modules/admin';
import type AdminModuleService from '../../../modules/admin/service';
import type { Logger, MedusaContainer } from '@medusajs/framework/types';
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils';

const assignShippingProfile = async (
	productIds: string[],
	container: MedusaContainer,
) => {
	const query = container.resolve(ContainerRegistrationKeys.QUERY);
	const logger: Logger = container.resolve('logger');

	const link = container.resolve(ContainerRegistrationKeys.LINK);
	const fulfillmentService = container.resolve(Modules.FULFILLMENT);
	const shippingProfile = await fulfillmentService
		.listShippingProfiles({
			type: ['default', 'standard'],
		})
		.then((r) => r[0])
		.catch(() => null);

	if (!shippingProfile) {
		logger.error('No shipping profile found');
		return;
	}

	try {
		const { data: productsWithShippingProfiles } = await query.graph({
			entity: 'product',
			fields: ['id', 'shipping_profile.*'],
			filters: {
				id: productIds,
			},
		});

		for (const productsWithShippingProfile of productsWithShippingProfiles) {
			if (productsWithShippingProfile.shipping_profile) {
				continue;
			}

			await link.create({
				[Modules.PRODUCT]: { product_id: productsWithShippingProfile.id },
				[Modules.FULFILLMENT]: {
					shipping_profile_id: shippingProfile.id,
				},
			});
		}
	} catch (error) {
		logger.error(
			`Error fetching products with shipping profile: ${error?.message}`,
		);
		return;
	}
};

createProductsWorkflow.hooks.productsCreated(
	async ({ products, additional_data }, { container }) => {
		const logger: Logger = container.resolve('logger');
		const adminService: AdminModuleService = container.resolve(ADMIN_MODULE);

		try {
			for (const product of products) {
				adminService.createAdminLogs({
					action: 'created',
					resource_id: product.id,
					resource_type: 'product',
					actor_id: (additional_data?.actor_id as string) || '',
				});
			}
		} catch (error) {
			logger.warn(`Error logging admin: ${error?.message}`);
		}

		assignShippingProfile(
			products.map((product) => product.id),
			container,
		);
	},
);

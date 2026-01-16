import type { AdminLog, AdminLogResponse } from '@customTypes/admin';
import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import type {
	CampaignDTO,
	MedusaContainer,
	PriceListDTO,
	PromotionDTO,
} from '@medusajs/framework/types';
import { Modules } from '@medusajs/framework/utils';
import { ADMIN_MODULE } from '../../../../../modules/admin';
import type AdminModuleService from '../../../../../modules/admin/service';

export async function GET(
	req: MedusaRequest,
	res: MedusaResponse,
): Promise<void> {
	const limit = req.query.limit
		? Number.parseInt(req.query.limit as string)
		: 20;
	const offset = req.query.offset
		? Number.parseInt(req.query.offset as string)
		: 0;

	const { created_at, actions, order: _order } = req.query;

	let order = {
		created_at: 'desc',
	};

	if (_order === 'created_at') {
		order = {
			created_at: 'desc',
		};
	}
	if (_order === '-created_at') {
		order = {
			created_at: 'asc',
		};
	}

	const filter = {
		$or: [],
		$and: [],
	};
	if (req.query.q) {
		filter.$or.push({
			metadata: {
				order_no: {
					$like: `%${req.query.q}%`,
				},
			},
		});
		filter.$or.push({
			metadata: {
				sku: {
					$like: `%${req.query.q}%`,
				},
			},
		});
		filter.$or.push({
			metadata: {
				title: {
					$like: `%${req.query.q}%`,
				},
			},
		});
		filter.$or.push({
			metadata: {
				product_title: {
					$like: `%${req.query.q}%`,
				},
			},
		});
		filter.$or.push({
			metadata: {
				variant_title: {
					$like: `%${req.query.q}%`,
				},
			},
		});
	}

	if (created_at) {
		// biome-ignore lint/complexity/useLiteralKeys: <explanation>
		filter['created_at'] = created_at;
	}

	if (actions) {
		const _actions = JSON.parse(actions as string) || [];
		const actionFilter = [];
		for (const _action of _actions) {
			const [resource, act] = _action.split('-');
			actionFilter.push({
				resource_type: resource,
				action: act,
			});
		}

		filter.$and.push({
			$or: actionFilter,
		});
	}

	const adminService: AdminModuleService = req.scope.resolve(ADMIN_MODULE);
	const [adminLogs, count] = await adminService.listAndCountAdminLogs(filter, {
		order,
		take: limit,
		skip: offset,
	});

	const activity_logs = await transformActivityLogs(
		adminLogs,
		offset,
		req.scope,
	);
	res.json({
		activity_logs,
		limit,
		offset,
		count,
	});
}

const transformActivityLogs = async (
	adminLogs: AdminLog[],
	offset,
	container: MedusaContainer,
): Promise<AdminLogResponse[]> => {
	const userService = container.resolve(Modules.USER);

	const results: AdminLogResponse[] = [];
	let no = offset + 1;
	for await (const adminLog of adminLogs) {
		const result: AdminLogResponse = {
			...adminLog,
			action_name: adminLog.action,
			no: no++,
			description: '',
			actor: adminLog.actor_id,
		};
		const user = await userService
			.retrieveUser(adminLog.actor_id)
			.catch(() => null);

		if (user?.email) {
			result.actor = user.email;
		}

		if (user?.first_name && user?.last_name) {
			result.actor = `${user.first_name} ${user.last_name}`;
		}

		const { description, sub_description } = await getActivityDescription(
			adminLog,
			container,
		);

		result.description = description;
		result.sub_description = sub_description;
		results.push(result);
	}

	return results;
};

const getActivityDescription = async (
	adminLog: AdminLog,
	container: MedusaContainer,
) => {
	switch (adminLog.resource_type) {
		case 'product':
			return generateProductActivity(adminLog, container);
		case 'product_variant':
			return generateProductVariantActivity(adminLog, container);
		case 'price':
			return generatePriceActivity(adminLog, container);
		case 'inventory_item':
			return generateInventotyItemActivity(adminLog, container);
		case 'promotion':
			return generatePromotionActivity(adminLog, container);
		case 'campaign':
			return generateCampaignActivity(adminLog, container);
		case 'flash_sale':
			return generateFlashSaleActivity(adminLog, container);
		default:
			return {
				description: 'Unknown activity',
				sub_description: '',
			};
	}
};

const generateInventotyItemActivity = async (
	adminLog: AdminLog,
	container: MedusaContainer,
) => {
	const { resource_id } = adminLog;

	const inventoryService = container.resolve(Modules.INVENTORY);
	const inventoryItem = await inventoryService
		.retrieveInventoryItem(resource_id, {
			withDeleted: true,
		})
		.catch(() => null);

	return {
		description: `${inventoryItem?.title} , sku: ${inventoryItem?.sku}`,
		sub_description: '',
	};
};

const generatePriceActivity = async (
	adminLog: AdminLog,
	container: MedusaContainer,
) => {
	const { metadata } = adminLog;
	const productId = metadata?.product_id as string;
	const variantId = metadata?.variant_id as string;
	if (!productId || !variantId) {
		return {
			description: 'Unknown activity',
			sub_description: '',
		};
	}

	const productService = container.resolve(Modules.PRODUCT);
	const product = await productService
		.retrieveProduct(productId, {
			withDeleted: true,
		})
		.catch(() => null);
	const variant = await productService
		.retrieveProductVariant(variantId as string, {
			withDeleted: true,
		})
		.catch(() => null);

	return {
		description: product?.title || '',
		sub_description: variant?.title || '',
	};
};

const generateProductActivity = async (
	adminLog: AdminLog,
	container: MedusaContainer,
) => {
	const productService = container.resolve(Modules.PRODUCT);
	const product = await productService
		.retrieveProduct(adminLog.resource_id, {
			withDeleted: true,
		})
		.catch(() => null);
	if (!product) {
		return {
			description: 'Product not found',
			sub_description: '',
		};
	}

	let description = product.title;
	if (product?.metadata?.sku) {
		description += `, sku: ${product.metadata.sku}`;
	}

	return {
		description,
		sub_description: '',
	};
};

const generateProductVariantActivity = async (
	adminLog: AdminLog,
	container: MedusaContainer,
) => {
	const productService = container.resolve(Modules.PRODUCT);
	const product = await productService
		.retrieveProduct(adminLog.resource_id, {
			withDeleted: true,
		})
		.catch(() => null);

	if (!adminLog.metadata?.variant_id) {
		return {
			description: '',
			sub_description: product?.title,
		};
	}

	const variant = await productService
		.retrieveProductVariant(adminLog.metadata?.variant_id as string, {
			withDeleted: true,
		})
		.catch(() => null);
	if (!variant) {
		return {
			description: 'Product variant not found',
			sub_description: product?.title,
		};
	}

	let description = variant.title;
	if (variant?.sku) {
		description += `, sku: ${variant.sku}`;
	}

	return {
		description: variant.title,
		sub_description: product?.title,
	};
};

const generatePromotionActivity = async (
	adminLog: AdminLog,
	container: MedusaContainer,
) => {
	const promotionService = container.resolve(Modules.PROMOTION);
	const promotion: PromotionDTO = await promotionService
		.retrievePromotion(adminLog.resource_id, {
			withDeleted: true,
		})
		.catch(() => null);
	if (!promotion) {
		return {
			description: 'Promotion not found',
			sub_description: '',
		};
	}

	const campaign: CampaignDTO = await promotionService
		.retrieveCampaign(promotion.campaign_id, {
			withDeleted: true,
		})
		.catch(() => null);

	const sub_description = campaign ? campaign.name : '';

	return {
		description: promotion.code,
		sub_description: sub_description,
	};
};

const generateCampaignActivity = async (
	adminLog: AdminLog,
	container: MedusaContainer,
) => {
	const promotionService = container.resolve(Modules.PROMOTION);
	const campaign: CampaignDTO = await promotionService
		.retrieveCampaign(adminLog.resource_id, {
			withDeleted: true,
		})
		.catch(() => null);

	if (!campaign) {
		return {
			description: 'Campaign not found',
			sub_description: '',
		};
	}

	return {
		description: campaign.name,
		sub_description: '',
	};
};

const generateFlashSaleActivity = async (
	adminLog: AdminLog,
	container: MedusaContainer,
) => {
	const pricingModuleService = container.resolve(Modules.PRICING);

	const flashSale: PriceListDTO = await pricingModuleService
		.retrievePriceList(adminLog.resource_id, {
			withDeleted: true,
		})
		.catch(() => null);

	if (!flashSale) {
		return {
			description: 'Flash sale not found',
			sub_description: '',
		};
	}

	return {
		description: flashSale.title ?? '',
		sub_description: '',
	};
};

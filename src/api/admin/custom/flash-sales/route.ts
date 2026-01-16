import type { PriceListCustom } from '@customTypes/price-list-custom';
import type {
	AuthenticatedMedusaRequest,
	MedusaResponse,
} from '@medusajs/framework/http';
import type {
	CreatePriceListWorkflowInputDTO,
	HttpTypes,
	IEventBusModuleService,
} from '@medusajs/framework/types';
import {
	ContainerRegistrationKeys,
	Modules,
	remoteQueryObjectFromString,
} from '@medusajs/framework/utils';
import { createPriceListsWorkflow } from '@medusajs/medusa/core-flows';
import type { PriceListCreateProductsSchema } from '../../../../admin/routes/flash-sale/common/schemas';
import { PRICE_LIST_CUSTOM_MODULE } from '../../../../modules/price-list-custom';
import type PriceListCustomModuleService from '../../../../modules/price-list-custom/service';
import { logCreateFlashSale } from '../../../utils/helpers/flash-sale-logs';
import {
	type PriceListCustomDTO,
	removeAndCreatePriceListWhenAssignFlashSale,
	transformPriceList,
} from './helpers';

interface CreatePriceListWorkflowInputCustomDTO
	extends CreatePriceListWorkflowInputDTO {
	products: PriceListCreateProductsSchema;
}

export const POST = async (
	req: AuthenticatedMedusaRequest<CreatePriceListWorkflowInputCustomDTO>,
	res: MedusaResponse,
) => {
	const price_list_data = req.body;

	const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
	const { data: vlStartsAt } = await query.graph({
		entity: 'price_list',
		fields: ['*', 'price_list_custom.*'],
		filters: {
			starts_at: { $lte: price_list_data.starts_at },
			ends_at: { $gte: price_list_data.starts_at },
			status: 'active',
		},
		pagination: {
			take: 999,
			skip: 0,
		},
	});
	const { data: vlEndsAt } = await query.graph({
		entity: 'price_list',
		fields: ['*', 'price_list_custom.*'],
		filters: {
			starts_at: { $lte: price_list_data.ends_at },
			ends_at: { $gte: price_list_data.ends_at },
			status: 'active',
		},
		pagination: {
			take: 999,
			skip: 0,
		},
	});
	const { data: vlOverlap } = await query.graph({
		entity: 'price_list',
		fields: ['*', 'price_list_custom.*'],
		filters: {
			starts_at: { $gte: price_list_data.starts_at },
			ends_at: { $lte: price_list_data.ends_at },
			status: 'active',
		},
		pagination: {
			take: 999,
			skip: 0,
		},
	});
	const isVlStartsAt =
		vlStartsAt.filter((value) => !!value.price_list_custom).length > 0;
	const isVlEndsAt =
		vlEndsAt.filter((value) => !!value.price_list_custom).length > 0;
	const isVlOverlap =
		vlOverlap.filter((value) => !!value.price_list_custom).length > 0;
	if (isVlStartsAt || isVlEndsAt || isVlOverlap) {
		return res.status(400).json({
			message: 'Flash sale timelines should not overlap.',
		});
	}

	try {
		const { result } = await createPriceListsWorkflow(req.scope).run({
			input: {
				price_lists_data: [price_list_data],
			},
		});
		const flash_sale = result[0] as PriceListCustomDTO;
		flash_sale.rank = 0;
		flash_sale.is_flash_sale = false;
		if (flash_sale) {
			const priceListCustomModuleService: PriceListCustomModuleService =
				req.scope.resolve(PRICE_LIST_CUSTOM_MODULE);
			const priceListCustom =
				await priceListCustomModuleService.createPriceListCustoms({
					rank: 0,
					is_flash_sale: true,
					products: Object.keys(price_list_data.products).map(
						(productId: string, index: number) => ({
							id: productId,
							rank: index,
						}),
					) as unknown as Record<string, unknown>,
				});

			const link = req.scope.resolve(ContainerRegistrationKeys.LINK);
			await link.create({
				[Modules.PRICING]: {
					price_list_id: flash_sale.id,
				},
				[PRICE_LIST_CUSTOM_MODULE]: {
					price_list_custom_id: priceListCustom.id,
				},
			});
			flash_sale.is_flash_sale = true;

			const listVariants = [];
			const variantIds: string[] = [];
			for await (const [_productId, product] of Object.entries(
				price_list_data.products || {},
			)) {
				const { variants: _variants } = product || {};
				for await (const [variantId, variant] of Object.entries(
					_variants || {},
				)) {
					const { flash_sale: flashSale } = variant || {};
					if (
						(typeof flashSale?.quantity === 'string' &&
							flashSale?.quantity !== '') ||
						typeof flashSale?.quantity === 'number'
					) {
						variantIds.push(variantId);
						listVariants.push({
							product_variant_id: variantId,
							price_list_custom_id: priceListCustom.id,
							quantity: flashSale.quantity,
							reserved_quantity: 0,
						});
					}
				}
			}

			const priceListVariants =
				await priceListCustomModuleService.createPriceListVariants(
					listVariants,
				);
			for await (const priceListVariant of priceListVariants) {
				await link.create({
					[Modules.PRODUCT]: {
						product_variant_id: priceListVariant.product_variant_id,
					},
					[PRICE_LIST_CUSTOM_MODULE]: {
						price_list_variant_id: priceListVariant.id,
					},
				});
			}
			await removeAndCreatePriceListWhenAssignFlashSale({
				req,
				variantIds,
				flash_sale_id: flash_sale.id,
				created_at: flash_sale.created_at,
			});
		}

		const eventBusService_: IEventBusModuleService = req.scope.resolve(
			Modules.EVENT_BUS,
		);
		eventBusService_.emit({
			name: 'flash-sale.created',
			data: {
				price_list_id: flash_sale.id,
			},
		});

		logCreateFlashSale(req, flash_sale.id);

		return res.json({
			flash_sale: flash_sale,
		});
	} catch (err) {
		return res.status(400).json({
			message: err.message,
		});
	}
};

export const GET = async (
	req: AuthenticatedMedusaRequest<HttpTypes.AdminPriceListListParams>,
	res: MedusaResponse<HttpTypes.AdminPriceListListResponse>,
) => {
	const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
	const { data: flashSalePriceLists } = (await query.graph({
		entity: 'price_list_custom',
		fields: ['*', 'price_list.*'],
		filters: {
			is_flash_sale: true,
		},
		pagination: {
			take: 9999,
			skip: 0,
		},
	})) as unknown as { data: PriceListCustom[] };

	const flashSalePriceListIds = flashSalePriceLists
		.map((flashSalePriceList) => flashSalePriceList.price_list?.id)
		.filter(Boolean);

	if (!req.queryConfig.pagination?.order) {
		req.queryConfig.pagination.order = {
			created_at: 'desc',
		};
	}

	const remoteQuery = req.scope.resolve(ContainerRegistrationKeys.REMOTE_QUERY);
	const queryObject = remoteQueryObjectFromString({
		entryPoint: 'price_list',
		variables: {
			filters: {
				...req.filterableFields,
				id: { $in: flashSalePriceListIds },
			},
			...req.queryConfig.pagination,
		},
		fields: req.queryConfig.fields,
	});

	const { rows: nonFlashSalePriceLists, metadata } =
		await remoteQuery(queryObject);

	const price_lists = nonFlashSalePriceLists.map((priceList) =>
		transformPriceList(priceList),
	);

	res.json({
		price_lists,
		count: metadata.count,
		offset: metadata.skip,
		limit: metadata.take,
	});
};

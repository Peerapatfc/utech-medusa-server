import type {
	AuthenticatedMedusaRequest,
	MedusaResponse,
} from '@medusajs/framework/http';
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils';
import { deletePriceListsWorkflow } from '@medusajs/medusa/core-flows';
import { logDeleteFlashSale } from 'src/api/utils/helpers/flash-sale-logs';
import { PRICE_LIST_CUSTOM_MODULE } from '../../../../../modules/price-list-custom';
import type PriceListCustomModuleService from '../../../../../modules/price-list-custom/service';
import { STOREFRONT_MODULE } from '../../../../../modules/storefront';
import type StorefrontModuleService from '../../../../../modules/storefront/service';

export const DELETE = async (
	req: AuthenticatedMedusaRequest,
	res: MedusaResponse,
) => {
	const id = req.params.id;
	const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
	const { data: priceLists } = await query.graph({
		entity: 'price_list',
		fields: [
			'*',
			'price_list_custom.*',
			'price_list_custom.price_list_variants.*',
			'price_list_custom.price_list_variants.product_variant.*',
			'prices.*',
			'prices.price_set.*',
			'prices.price_set.variant.*',
		],
		filters: {
			id,
		},
		pagination: {
			take: 1,
			skip: 0,
		},
	});

	const priceListCustomId = priceLists[0]?.price_list_custom?.id;
	if (!priceListCustomId) {
		return res.status(400).json({
			message: 'Price list custom not found',
		});
	}

	const priceListVariants =
		priceLists[0]?.price_list_custom?.price_list_variants;
	if (!priceListVariants) {
		return res.status(400).json({
			message: 'Price list variant not found',
		});
	}

	const priceListVariantIds = [];
	for (const priceListVariant of priceListVariants) {
		priceListVariantIds.push(priceListVariant.id);
	}

	try {
		const link = req.scope.resolve(ContainerRegistrationKeys.LINK);
		const priceListCustomModuleService: PriceListCustomModuleService =
			req.scope.resolve(PRICE_LIST_CUSTOM_MODULE);

		for await (const priceListVariant of priceListVariants) {
			await priceListCustomModuleService.softDeletePriceListVariants({
				id: [priceListVariant.id],
			});
			await link.dismiss({
				[Modules.PRODUCT]: {
					product_variant_id: priceListVariant.product_variant.id,
				},
				[PRICE_LIST_CUSTOM_MODULE]: {
					price_list_variant_id: priceListVariant.id,
				},
			});
		}

		await priceListCustomModuleService.softDeletePriceListCustoms({
			id: [priceListCustomId],
		});
		await link.dismiss({
			[Modules.PRICING]: {
				price_list_id: id,
			},
			[PRICE_LIST_CUSTOM_MODULE]: {
				price_list_custom_id: priceListCustomId,
			},
		});

		await deletePriceListsWorkflow(req.scope).run({
			input: {
				ids: [id],
			},
		});

		const storefrontService: StorefrontModuleService =
			req.scope.resolve(STOREFRONT_MODULE);
		storefrontService.revalidateTags([
			'custom-products',
			'products',
			'flash-sales',
		]);

		logDeleteFlashSale(req, id);

		res.status(201).json({
			success: true,
		});
	} catch (err) {
		return res.status(400).json({
			message: err.message,
		});
	}
};

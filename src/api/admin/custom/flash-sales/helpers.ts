import type { MedusaRequest } from '@medusajs/framework';
import type {
	IPricingModuleService,
	MedusaContainer,
	PriceListDTO,
} from '@medusajs/framework/types';
import {
	buildPriceListRules,
	buildPriceSetPricesForCore,
	ContainerRegistrationKeys,
	Modules,
	remoteQueryObjectFromString,
} from '@medusajs/framework/utils';
import {
	createPriceListsWorkflow,
	deletePriceListsWorkflow,
} from '@medusajs/medusa/core-flows';

export interface PriceListCustomDTO extends PriceListDTO {
	rank: number;
	is_flash_sale: boolean;
	created_at: string | Date;
}

export const transformPriceList = (priceList) => {
	priceList.rules = buildPriceListRules(priceList.price_list_rules);
	priceList.prices = buildPriceSetPricesForCore(priceList.prices);

	priceList.price_list_rules = undefined;

	return priceList;
};

export const fetchPriceListPriceIdsForProduct = async (
	priceListId: string,
	productIds: string[],
	scope: MedusaContainer,
): Promise<string[]> => {
	const remoteQuery = scope.resolve(ContainerRegistrationKeys.REMOTE_QUERY);
	const priceSetIds: string[] = [];
	const variants = await remoteQuery(
		remoteQueryObjectFromString({
			entryPoint: 'variants',
			variables: { filters: { product_id: productIds } },
			fields: ['price_set.id'],
		}),
	);

	for (const variant of variants) {
		if (variant.price_set?.id) {
			priceSetIds.push(variant.price_set.id);
		}
	}

	const productPrices = await remoteQuery(
		remoteQueryObjectFromString({
			entryPoint: 'prices',
			variables: {
				filters: { price_set_id: priceSetIds, price_list_id: priceListId },
			},
			fields: ['id'],
		}),
	);

	return productPrices.map((price) => price.id);
};

export const removeAndCreatePriceListWhenAssignFlashSale = async ({
	req,
	variantIds,
	flash_sale_id,
	created_at,
}: {
	req: MedusaRequest;
	variantIds: string[];
	flash_sale_id: string;
	created_at: string | Date;
}): Promise<void> => {
	const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
	const { data: variants } = await query.graph({
		entity: 'variant',
		fields: ['price_set.*'],
		filters: {
			id: variantIds,
		},
	});
	const pricingModuleService: IPricingModuleService = req.scope.resolve(
		Modules.PRICING,
	);
	const price_set_ids = variants.map((variant) => variant.price_set.id);
	const prices = await pricingModuleService.listPrices({
		price_set_id: price_set_ids,
	});
	const price_list_ids = prices
		.filter(
			(price) => price.price_list && price.price_list.id !== flash_sale_id,
		)
		.map((price) => price.price_list.id);
	const { data: oldPriceLists } = await query.graph({
		entity: 'price_list',
		fields: [
			'*',
			'price_list_custom.*',
			'prices.*',
			'prices.price_set.*',
			'prices.price_set.variant.*',
		],
		filters: {
			id: price_list_ids,
			status: 'active',
			created_at: {
				$lt: created_at,
			},
		},
		pagination: {
			take: 999,
			skip: 0,
		},
	});
	for (const oldPriceList of oldPriceLists) {
		const endsAt = oldPriceList.ends_at;
		const isExpired = endsAt ? new Date(endsAt) < new Date() : false;
		// เช็ค flash sale และ หมดอายุ
		if (oldPriceList.price_list_custom || isExpired) {
			continue;
		}
		const priceListRules = await pricingModuleService.listPriceListRules({
			price_list_id: [oldPriceList.id],
		});
		const priceListRule = priceListRules?.[0];
		const priceRules = await pricingModuleService.listPriceRules({
			// @ts-ignore
			price_id: oldPriceList.prices.map((price) => price.id),
		});
		await deletePriceListsWorkflow(req.scope).run({
			input: {
				ids: [oldPriceList.id],
			},
		});
		await createPriceListsWorkflow(req.scope).run({
			input: {
				price_lists_data: [
					{
						title: oldPriceList.title,
						description: oldPriceList.description,
						starts_at: oldPriceList.starts_at as string,
						ends_at: oldPriceList.ends_at as string,
						status: oldPriceList.status,
						rules: priceListRule
							? { [priceListRule.attribute]: priceListRule.value as string[] }
							: null,
						prices: oldPriceList.prices.map((price) => {
							const priceRule = priceRules.find(
								(priceRule) => priceRule.price_id === price.id,
							);
							return {
								amount: price.amount,
								currency_code: price.currency_code,
								variant_id: price.price_set.variant.id,
								max_quantity: price.max_quantity,
								min_quantity: price.min_quantity,
								rules: priceRule
									? { [priceRule.attribute]: priceRule.value }
									: null,
							};
						}),
					},
				],
			},
		});
	}
};

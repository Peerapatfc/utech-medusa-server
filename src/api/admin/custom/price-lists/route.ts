import type {
	AuthenticatedMedusaRequest,
	MedusaResponse,
} from '@medusajs/framework/http';
import {
	ContainerRegistrationKeys,
	Modules,
	remoteQueryObjectFromString,
} from '@medusajs/framework/utils';
import { transformPriceList } from './helpers';
import type { HttpTypes } from '@medusajs/framework/types';
import type { PriceListCustom } from '@customTypes/price-list-custom';

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
				id: { $nin: flashSalePriceListIds },
			},
			...req.queryConfig.pagination,
		},
		fields: req.queryConfig.fields,
	});

	const { rows: nonFlashSalePriceLists, metadata } =
		await remoteQuery(queryObject);

	res.json({
		price_lists: nonFlashSalePriceLists.map((priceList) =>
			transformPriceList(priceList),
		),
		count: metadata.count,
		offset: metadata.skip,
		limit: metadata.take,
	});
};

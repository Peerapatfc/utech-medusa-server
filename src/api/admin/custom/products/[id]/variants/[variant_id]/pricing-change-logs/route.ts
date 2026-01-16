import type { MedusaRequest, MedusaResponse } from '@medusajs/framework';
import type {
	IRegionModuleService,
	IUserModuleService,
} from '@medusajs/framework/types';
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils';

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
	const { id: productId, variant_id } = req.params;
	const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
	const limit = req.query.limit
		? Number.parseInt(req.query.limit as string)
		: 20;

	const offset = req.query.offset
		? Number.parseInt(req.query.offset as string)
		: 0;

	const { data: pricingChangeLogs, metadata } = await query.graph({
		entity: 'product_pricing_logs',
		fields: ['*'],
		filters: {
			product_id: productId,
			variant_id,
		},
		pagination: {
			skip: offset,
			take: limit,
			order: {
				created_at: 'desc',
			},
		},
	});

	const userService: IUserModuleService = req.scope.resolve(Modules.USER);
	const regionService: IRegionModuleService = req.scope.resolve(Modules.REGION);
	for await (const pricingChangeLog of pricingChangeLogs) {
		const admin = await userService
			.retrieveUser(pricingChangeLog.actor_id)
			.catch(() => null);

		// biome-ignore lint/complexity/useLiteralKeys: <explanation>
		pricingChangeLog['actor_name'] = admin
			? `${admin.first_name} ${admin.last_name}`
			: pricingChangeLog.actor_id;

		// biome-ignore lint/complexity/useLiteralKeys: <explanation>
		pricingChangeLog['change'] = transformChange(
			pricingChangeLog.previous_amount,
			pricingChangeLog.new_amount,
		);

		const {
			data: [price],
		} = await query.graph({
			entity: 'prices',
			fields: ['*', 'price_rules.*'],
			filters: {
				id: pricingChangeLog.price_id,
			},
		});

		const regionPriceRule = price.price_rules.find(
			(rule) => rule.attribute === 'region_id',
		);

		if (!regionPriceRule) {
			// biome-ignore lint/complexity/useLiteralKeys: <explanation>
			pricingChangeLog['price_type'] = price.currency_code?.toUpperCase();
			continue;
		}

		const region = await regionService
			.retrieveRegion(regionPriceRule.value)
			.catch(() => null);
		if (region) {
			// biome-ignore lint/complexity/useLiteralKeys: <explanation>
			pricingChangeLog['price_type'] = region.name;
		}
	}

	res.status(200).json({
		pricing_change_logs: pricingChangeLogs,
		count: metadata.count,
		limit,
		offset,
	});
};

const transformChange = (previous_amount: number, new_amount: number) => {
	const diff = new_amount - previous_amount;
	if (diff === 0) {
		return '0';
	}

	return diff > 0 ? `+${diff}` : `${diff}`;
};

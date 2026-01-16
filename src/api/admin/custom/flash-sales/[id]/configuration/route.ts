import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { updatePriceListsWorkflow } from "@medusajs/medusa/core-flows";
import type { UpdatePriceListWorkflowInputDTO } from "@medusajs/framework/types";
import {
	ContainerRegistrationKeys,
	PriceListStatus,
} from "@medusajs/framework/utils";
import type { PriceListCreateProductsSchema } from "../../../../../../admin/routes/flash-sale/common/schemas";
import type StorefrontModuleService from "../../../../../../modules/storefront/service";
import { STOREFRONT_MODULE } from "../../../../../../modules/storefront";

interface UpdatePriceListWorkflowInputCustomDTO
	extends UpdatePriceListWorkflowInputDTO {
	rank: number;
	is_flash_sale: boolean;
	products: PriceListCreateProductsSchema;
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
	const id = req.params.id;
	const price_list_data = req.body as UpdatePriceListWorkflowInputCustomDTO;
	price_list_data.id = id;

	const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
	const { data: vlStartsAt } = await query.graph({
		entity: "price_list",
		fields: ["*", "price_list_custom.*"],
		filters: {
			id: { $ne: price_list_data.id },
			starts_at: { $lte: price_list_data.starts_at },
			ends_at: { $gte: price_list_data.starts_at },
			status: PriceListStatus.ACTIVE,
		},
		pagination: {
			take: 999,
			skip: 0,
		},
	});
	const { data: vlEndsAt } = await query.graph({
		entity: "price_list",
		fields: ["*", "price_list_custom.*"],
		filters: {
			id: { $ne: price_list_data.id },
			starts_at: { $lte: price_list_data.ends_at },
			ends_at: { $gte: price_list_data.ends_at },
			status: PriceListStatus.ACTIVE,
		},
		pagination: {
			take: 999,
			skip: 0,
		},
	});
	const { data: vlOverlap } = await query.graph({
		entity: "price_list",
		fields: ["*", "price_list_custom.*"],
		filters: {
			id: { $ne: price_list_data.id },
			starts_at: { $gte: price_list_data.starts_at },
			ends_at: { $lte: price_list_data.ends_at },
			status: PriceListStatus.ACTIVE,
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
			message: "Flash sale timelines should not overlap.",
		});
	}

	try {
		const { result } = await updatePriceListsWorkflow(req.scope).run({
			input: {
				price_lists_data: [price_list_data],
			},
		});
		const flash_sale = result as UpdatePriceListWorkflowInputCustomDTO;

		// Revalidate tags
		const storefrontService: StorefrontModuleService =
			req.scope.resolve(STOREFRONT_MODULE);
		storefrontService.revalidateTags([
			"products",
			"custom-products",
			"flash-sales",
		]);

		return res.json({
			flash_sale: flash_sale,
		});
	} catch (err) {
		return res.status(400).json({
			message: err.message,
		});
	}
};

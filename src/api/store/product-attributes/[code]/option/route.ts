import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import type ProductAttributeService from "../../../../../modules/product-attributes/service";

export async function GET(
	req: MedusaRequest,
	res: MedusaResponse,
): Promise<void> {
	const productAttributeService: ProductAttributeService = req.scope.resolve(
		"productAttributeModuleService",
	);
	const { code } = req.params;
	const { limit = 30, offset = 0 } = req.query;

	const sortBy =
		typeof req.query.sortBy === "string" ? req.query.sortBy : undefined;
	const sortAttribute = sortBy?.split("_")[0];
	const sortDirection = sortBy?.split("_")[1];

	try {
		const attribute = await productAttributeService.listProductAttributes({
			code: code,
		});

		const options =
			await productAttributeService.listAndCountProductAttributeOptions(
				{ attribute_id: attribute?.[0]?.id },
				{
					order: {
						[sortAttribute]: sortDirection as "ASC" | "DESC",
					},
					take: Number(limit),
					skip: Number(offset),
				},
			);

		if (options?.[1] === 0) {
			res.status(404).json({ message: "Options not found" });
			return;
		}
		res.json({ options: options?.[0], count: options?.[1] });
	} catch (error) {
		console.error("Error fetching attribute options:", error);
		res.status(500).json({ error: "Internal server error" });
	}
}

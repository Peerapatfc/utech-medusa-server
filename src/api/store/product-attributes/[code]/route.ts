import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import type ProductAttributeService from "../../../../modules/product-attributes/service";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
	const productAttributeService: ProductAttributeService = req.scope.resolve(
		"productAttributeModuleService",
	);

	const { code } = req.params;

	try {
		const attribute =
			await productAttributeService.retrieveProductAttribute(code);
		res.json({ attribute });
	} catch (error) {
		res.status(500).json({ error: "Internal server error" });
	}
}

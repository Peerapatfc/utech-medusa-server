import type { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import type { IProductModuleService, Logger } from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";

interface IUpdateProduct {
	short_description: string;
}

export const PATCH = async (
	req: MedusaRequest<IUpdateProduct>,
	res: MedusaResponse,
) => {
	const { id } = req.params;
	const { body } = req;
	const logger: Logger = req.scope.resolve("logger");

	const productService: IProductModuleService = req.scope.resolve(
		Modules.PRODUCT,
	);

	try {
		const product = await productService.retrieveProduct(id);
		if (!product) {
			return res.status(404).json({
				success: false,
				message: `Product with id: ${id} not found on Medusa!`,
			});
		}

		if (!body.short_description) {
			return res.status(400).json({
				success: false,
				message: "Short description is required!",
			});
		}

		const isShortDescriptionEqual =
			product.metadata?.short_description === body.short_description;

		logger.info(
			`strapi is syncing product content >> isShortDescriptionEqual: ${isShortDescriptionEqual}, strapi data: ${body.short_description}`,
		);

		if (isShortDescriptionEqual) {
			res.status(200).json({
				success: true,
				message: `Product with id: ${id} already has the same short description!`,
			});
			return;
		}

		await productService.updateProducts(id, {
			metadata: {
				...product.metadata,
				short_description: body.short_description || "",
			},
		});

		res.status(200).json({
			success: true,
			message: `Product with id: ${id} updated!`,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

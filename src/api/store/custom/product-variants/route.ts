import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import type { IProductModuleService } from '@medusajs/types';
import { Modules } from '@medusajs/utils';
import { PRODUCT_VARIANT_IMAGES_MODULE } from '../../../../modules/product-variant-images';
import type ProductVariantImagesService from '../../../../modules/product-variant-images/service';

export async function GET(
	req: MedusaRequest,
	res: MedusaResponse,
): Promise<void> {
	const variant_ids = req.query.ids as string;
	if (!variant_ids) {
		res.status(200).json({
			variants: [],
		});
		return;
	}

	const productVariantImagesService: ProductVariantImagesService =
		req.scope.resolve(PRODUCT_VARIANT_IMAGES_MODULE);
	const productModuleService: IProductModuleService = req.scope.resolve(
		Modules.PRODUCT,
	);
	const variants = await productModuleService.listProductVariants(
		{
			id: variant_ids.split(','),
		},
		{
			relations: ['product'],
			take: 9999,
			skip: 0,
		},
	);
	const variant_images =
		await productVariantImagesService.listProductVariantImagesModules(
			{
				variant_id: variant_ids.split(','),
			},
			{
				take: 9999,
				skip: 0,
				order: {
					rank: 'ASC',
				},
			},
		);
	const new_variants = [];
	variants.map((item) => {
		const images = [];
		variant_images.map((image) => {
			if (image.variant_id === item.id) {
				images.push(image);
			}
		});
		const new_item = {
			...item,
			images,
		};
		new_variants.push(new_item);
	});
	res.json({
		variants: new_variants,
	});
}

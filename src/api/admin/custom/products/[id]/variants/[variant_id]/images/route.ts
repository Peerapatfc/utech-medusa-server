import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import type { IProductModuleService } from '@medusajs/framework/types';
import { Modules } from '@medusajs/framework/utils';
import { PRODUCT_VARIANT_IMAGES_MODULE } from '../../../../../../../../modules/product-variant-images';
import type ProductVariantImagesService from '../../../../../../../../modules/product-variant-images/service';
import type { ProductVariantDTO } from '@customTypes/variants';
import type StorefrontModuleService from '../../../../../../../../modules/storefront/service';
import { STOREFRONT_MODULE } from '../../../../../../../../modules/storefront';

export async function POST(
	req: MedusaRequest,
	res: MedusaResponse,
): Promise<void> {
	const params = req.params;
	const body = req.body as ProductVariantDTO;
	const images = body.images;
	const productVariantImagesService: ProductVariantImagesService =
		req.scope.resolve(PRODUCT_VARIANT_IMAGES_MODULE);
	await productVariantImagesService.deleteProductVariantImagesModules({
		variant_id: [params.variant_id],
	});
	if (Array.isArray(images)) {
		await Promise.all(
			images.map(async (url, rank) => {
				await productVariantImagesService.createProductVariantImagesModules([
					{
						variant_id: params.variant_id,
						url: url as unknown as string,
						rank,
					},
				]);
			}),
		);
	} else {
		await productVariantImagesService.createProductVariantImagesModules([
			{
				variant_id: params.variant_id,
				url: images,
				rank: 0,
			},
		]);
	}
	const productModuleService: IProductModuleService = req.scope.resolve(
		Modules.PRODUCT,
	);
	const product = await productModuleService.retrieveProduct(params.id, {
		relations: ['variants', 'images'],
	});
	const variant_ids = product.variants.map((variant) => variant.id);
	const variant_images =
		await productVariantImagesService.listProductVariantImagesModules(
			{
				variant_id: variant_ids,
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
	product.variants.map((item) => {
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

	const storefrontService: StorefrontModuleService =
		req.scope.resolve(STOREFRONT_MODULE);
	storefrontService.revalidateTags(['products']);

	res.json({
		variants: new_variants,
	});
}

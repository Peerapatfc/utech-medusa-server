import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { batchPriceListPricesWorkflow } from '@medusajs/medusa/core-flows';
import type { BatchPriceListPricesWorkflowDTO } from '@medusajs/framework/types';
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils';
import type { PriceListUpdateProductsSchema } from '../../../../../../admin/routes/flash-sale/common/schemas';
import type { z } from 'zod';
import type PriceListCustomModuleService from '../../../../../../modules/price-list-custom/service';
import { PRICE_LIST_CUSTOM_MODULE } from '../../../../../../modules/price-list-custom';
import type StorefrontModuleService from '../../../../../../modules/storefront/service';
import { STOREFRONT_MODULE } from '../../../../../../modules/storefront';
import { removeAndCreatePriceListWhenAssignFlashSale } from '../../helpers';

interface BatchPriceListPricesWorkflowCustomDTO
	extends BatchPriceListPricesWorkflowDTO {
	products: z.infer<typeof PriceListUpdateProductsSchema>;
}

export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
	const id = req.params.id;
	const _productIds = req.query.productIds as string;
	const productIds = _productIds.split(',');

	const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
	const { data: productListCustoms } = await query.graph({
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
			id: id,
		},
		pagination: {
			take: 1,
			skip: 0,
		},
	});

	const priceListCustomId = productListCustoms[0]?.price_list_custom?.id;
	const productListCustom = productListCustoms[0];
	if (!priceListCustomId) {
		return res.status(400).json({
			message: 'Price list custom not found',
		});
	}

	const priceListVariants =
		productListCustoms[0]?.price_list_custom?.price_list_variants;
	if (!priceListVariants) {
		return res.status(400).json({
			message: 'Price list variant not found',
		});
	}

	try {
		const link = req.scope.resolve(ContainerRegistrationKeys.LINK);
		const priceListCustomModuleService: PriceListCustomModuleService =
			req.scope.resolve(PRICE_LIST_CUSTOM_MODULE);
		for (const priceListVariant of priceListVariants) {
			if (productIds.includes(priceListVariant.product_variant.product_id)) {
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
		}
		const oldProducts =
			productListCustoms[0]?.price_list_custom?.products ?? [];
		const newProducts: { id: string; rank: number }[] = [];
		let i = 0;
		for (const oldProduct of oldProducts as Record<string, unknown>[]) {
			const isRemoved =
				productIds.filter((productId) => productId === oldProduct.id).length >
				0;
			if (!isRemoved) {
				newProducts.push({
					id: oldProduct.id as string,
					rank: i,
				});
				i++;
			}
		}
		await priceListCustomModuleService.updatePriceListCustoms({
			id: priceListCustomId,
			...productListCustom,
			products: newProducts as unknown as Record<string, unknown>,
		});

		res.status(201).json({
			success: true,
		});
	} catch (err) {
		return res.status(400).json({
			message: err.message,
		});
	}
};

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
	const id = req.params.id;
	const body = req.body as BatchPriceListPricesWorkflowCustomDTO;

	const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
	const { data } = await query.graph({
		entity: 'price_list',
		fields: ['*', 'price_list_custom.*'],
		filters: {
			id,
		},
		pagination: {
			take: 1,
			skip: 0,
		},
	});

	if (!data[0]) {
		return res.status(400).json({
			message: 'Find not found Price List',
		});
	}

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

	try {
		const { result } = await batchPriceListPricesWorkflow(req.scope).run({
			input: {
				data: {
					id,
					create: body.create ?? [],
					update: body.update ?? [],
					delete: body.delete ?? [],
				},
			},
		});

		const priceList = priceLists[0];
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

		const priceListCustomModuleService: PriceListCustomModuleService =
			req.scope.resolve(PRICE_LIST_CUSTOM_MODULE);
		const link = req.scope.resolve(ContainerRegistrationKeys.LINK);
		const variantIds: string[] = [];
		for (const [_productId, product] of Object.entries(body.products || {})) {
			const { variants: _variants } = product || {};
			for (const [variantId, variant] of Object.entries(_variants || {})) {
				const { flash_sale: flashSale } = variant || {};
				const _variant = {
					product_variant_id: variantId,
					price_list_custom_id: priceListCustomId,
					quantity: flashSale?.quantity as number,
					reserved_quantity: 0,
				};
				const priceListVariant = priceListVariants.filter(
					(priceListVariant) =>
						priceListVariant.product_variant_id === variantId &&
						!priceListVariant.deleted_at,
				);
				if (priceListVariant[0]?.id && !priceListVariant[0]?.deleted_at) {
					if (
						(typeof _variant.quantity === 'string' &&
							_variant.quantity !== '') ||
						typeof _variant.quantity === 'number'
					) {
						await priceListCustomModuleService.updatePriceListVariants({
							id: priceListVariant[0]?.id as string,
							..._variant,
						});
					} else {
						await priceListCustomModuleService.softDeletePriceListVariants({
							id: [priceListVariant[0]?.id],
						});
						await link.dismiss({
							[Modules.PRODUCT]: {
								product_variant_id: priceListVariant[0]?.product_variant.id,
							},
							[PRICE_LIST_CUSTOM_MODULE]: {
								price_list_variant_id: priceListVariant[0]?.id,
							},
						});
					}
				} else {
					if (
						typeof _variant?.quantity === 'string' ||
						typeof _variant?.quantity === 'number'
					) {
						variantIds.push(variantId);
						const createPriceListVariant =
							await priceListCustomModuleService.createPriceListVariants({
								..._variant,
							});
						await link.create({
							[Modules.PRODUCT]: {
								product_variant_id: _variant.product_variant_id,
							},
							[PRICE_LIST_CUSTOM_MODULE]: {
								price_list_variant_id: createPriceListVariant.id,
							},
						});
					}
				}
			}
		}

		const { data: productListCustoms } = await query.graph({
			entity: 'price_list',
			fields: ['*', 'price_list_custom.*'],
			filters: {
				id: id,
			},
			pagination: {
				take: 1,
				skip: 0,
			},
		});
		const oldProducts =
			(
				productListCustoms[0]?.price_list_custom?.products as unknown as Record<
					string,
					unknown
				>[]
			)?.map((product) => product.id) ?? [];
		let newProducts = Object.keys(body.products).map((key) => key);
		newProducts = [...new Set(newProducts)];
		let mergeProducts = oldProducts.concat(newProducts);
		mergeProducts = [...new Set(mergeProducts)];
		const products = mergeProducts.map((productId: string, index: number) => ({
			id: productId,
			rank: index,
		}));
		await priceListCustomModuleService.updatePriceListCustoms({
			id: productListCustoms[0]?.price_list_custom.id,
			products: products as unknown as Record<string, unknown>,
		});

		await removeAndCreatePriceListWhenAssignFlashSale({
			req,
			variantIds,
			flash_sale_id: id,
			created_at: priceList.created_at,
		});

		const storefrontService: StorefrontModuleService =
			req.scope.resolve(STOREFRONT_MODULE);
		// Revalidate tags
		storefrontService.revalidateTags([
			'products',
			'custom-products',
			'flash-sales',
		]);

		return res.json({
			result,
		});
	} catch (err) {
		return res.status(400).json({
			message: err.message,
		});
	}
};

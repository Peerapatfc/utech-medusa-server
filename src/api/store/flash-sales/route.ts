import type { PriceListCustom } from '@customTypes/price-list-custom';
import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import type {
	IProductModuleService,
	PriceDTO,
	PriceListDTO,
	ProductVariantDTO,
} from '@medusajs/framework/types';
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils';
import getProductDetailWorkflow from '../../../workflows/product/get-products-detail';
import type { FlashSale } from './type';
import { ProductWithFlashSale } from '@customTypes/products';
import { mapProductAttributes } from '../custom/products/helper';

interface CustomPriceListDTO extends PriceListDTO {
	price_list_custom?: PriceListCustom;
	prices: PriceDTO[];
}

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
	const queryFields = req.query;
	const limit = queryFields.limit
		? Number.parseInt(queryFields.limit as string)
		: 4;

	const productLimit = queryFields.product_limit
		? Number.parseInt(queryFields.product_limit as string)
		: 20;
	const productOffset = queryFields.product_offset
		? Number.parseInt(queryFields.product_offset as string)
		: 0;
	const productOrder = queryFields.product_order
		? queryFields.product_order.toString()
		: '';

	const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
	const { data: priceListCustoms } = (await query.graph({
		entity: 'price_list_custom',
		fields: ['*', 'price_list.*'],
		filters: {
			is_flash_sale: true,
			deleted_at: null,
		},
		pagination: {
			take: 999,
			skip: 0,
		},
	})) as unknown as { data: PriceListCustom[] };

	const flashSalePriceListIds = priceListCustoms
		.map((flashSalePriceList) => flashSalePriceList.price_list?.id)
		.filter(Boolean);

	const twoDaysFromNow = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);

	const { data: flashSalePriceLists } = (await query.graph({
		entity: 'price_list',
		fields: [
			'*',
			'prices.*',
			'prices.price_set.*',
			'prices.price_set.variant.id',
			'price_list_custom.*',
			'price_list_custom.price_list_variants.*',
		],
		filters: {
			id: { $in: flashSalePriceListIds },
			ends_at: { $gte: new Date() },
			starts_at: { $lte: twoDaysFromNow },
			status: 'active',
		},
		pagination: {
			take: limit,
			skip: 0,
			order: {
				ends_at: 'asc',
			},
		},
	})) as unknown as { data: CustomPriceListDTO[] };

	const productService: IProductModuleService = req.scope.resolve(
		Modules.PRODUCT,
	);
	const flashSales: FlashSale[] = [];
	for await (const priceList of flashSalePriceLists) {
		const priceListCustom = priceList.price_list_custom;
		const priceListVariants = priceListCustom.price_list_variants;

		const variantIds = priceListVariants.map(
			(variant) => variant.product_variant_id,
		);
		const variants = await productService.listProductVariants(
			{
				id: variantIds,
			},
			{
				select: ['id', 'product_id', 'product.status'],
				relations: ['product'],
			},
		);

		const publishedVariants = variants.filter(
			(variant) => variant.product?.status === 'published',
		);

		let allProducts = [];
		let products = [];
		const productIds = publishedVariants.map((variant) => variant.product_id);
		if (productIds?.length) {
			const { result: productsData } = (await getProductDetailWorkflow(
				req.scope,
			).run({
				input: {
					productIds,
				},
			})) as unknown as { result: ProductWithFlashSale[] };

			allProducts = mapFlashSaleProducts({
				flashSale: priceList,
				products: productsData,
				variants: publishedVariants,
			});

			allProducts = sortingProducts({
				products: allProducts,
				orderBy: productOrder,
				sortedByProductRank: priceListCustom?.products || [],
			});
			products = allProducts.slice(productOffset, productOffset + productLimit);
			products = await mapProductAttributes(req, products);
		}

		flashSales.push({
			...priceList,
			prices: undefined,
			price_list_custom: undefined,
			products,
			count: allProducts.length,
			offset: productOffset,
			limit: productLimit,
		});
	}

	res.json({
		flash_sales: flashSales,
	});
};

export const sortingProducts = ({
	products,
	orderBy,
	sortedByProductRank,
}: {
	products: ProductWithFlashSale[];
	orderBy: string;
	sortedByProductRank: {
		id: string;
		rank: number;
	}[];
}) => {
	if (!products.length) {
		return [];
	}

	if (orderBy === 'price_asc') {
		products.sort((a, b) => {
			const aPrice = a.flash_sale_min_price;
			const bPrice = b.flash_sale_min_price;
			return aPrice - bPrice;
		});

		return products;
	}

	if (orderBy === 'price_desc') {
		products.sort((a, b) => {
			const aPrice = a.flash_sale_min_price;
			const bPrice = b.flash_sale_min_price;
			return bPrice - aPrice;
		});

		return products;
	}

	// sorting by sortedByProductRank
	if (sortedByProductRank.length) {
		const sortedProducts = [];
		for (const product of sortedByProductRank) {
			const foundProduct = products.find((p) => p.id === product.id);
			if (foundProduct) {
				sortedProducts.push(foundProduct);
			}
		}

		const restProducts = products.filter(
			(product) => !sortedByProductRank.find((p) => p.id === product.id),
		);

		return sortedProducts.concat(restProducts);
	}

	return products;
};

export const mapFlashSaleProducts = ({
	flashSale,
	products,
	variants,
}: {
	flashSale: CustomPriceListDTO;
	products: ProductWithFlashSale[];
	variants: ProductVariantDTO[];
}) => {
	const { prices } = flashSale;

	const priceListCustom = flashSale.price_list_custom;
	const priceListVariants = priceListCustom?.price_list_variants || [];

	for (const product of products) {
		const variantIds = variants
			.filter((variant) => variant.product_id === product.id)
			.map((variant) => variant.id);
		const priceListVariant = priceListVariants.filter((_pv) =>
			variantIds.includes(_pv.product_variant_id),
		);

		const quantity = priceListVariant.reduce(
			(acc, productVariant) => acc + productVariant.quantity,
			0,
		);
		const reserved_quantity = priceListVariant.reduce(
			(acc, productVariant) => acc + productVariant.reserved_quantity,
			0,
		);
		product.is_flash_sale = true;
		product.flash_sale = {
			...flashSale,
			prices: undefined,
			price_list_custom: undefined,
			reserved_quantity,
			quantity,
		};

		const productVariants = product.variants as any[];
		let flashSaleMinPrice =
			productVariants[0].calculated_price?.calculated_amount || 0;
		for (const variant of productVariants) {
			const variantPrice = prices.find((price) => {
				const priceSet = price.price_set as any;
				priceSet?.variant?.id === variant.id;
			});

			if (!variantPrice) {
				continue;
			}

			if (variant.calculated_price?.calculated_amount === undefined) {
				variant.calculated_price = {
					calculated_amount: null,
				};
			}
			variant.calculated_price.calculated_amount = variantPrice.amount;
			flashSaleMinPrice = Math.min(
				flashSaleMinPrice,
				variantPrice.amount as number,
			);
		}
		product.flash_sale_min_price = flashSaleMinPrice;
	}

	return products;
};

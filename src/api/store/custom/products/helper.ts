import type { PriceListCustom } from '@customTypes/price-list-custom';
import { MedusaRequest } from '@medusajs/framework/http';
import type {
	IProductModuleService,
	MedusaContainer,
	PriceListDTO,
	ProductDTO,
} from '@medusajs/framework/types';
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils';
import { PRODUCT_ATTRIBUTE_MODULE } from '../../../../modules/product-attributes';
import ProductAttributeService from '../../../../modules/product-attributes/service';
import {
	ProductWithFlashSale,
	ProductWithAttribute,
} from '@customTypes/products';

export const mapFlashSaleProducts = async ({
	container,
	products,
}: {
	container: MedusaContainer;
	products: ProductWithFlashSale[];
}) => {
	const query = container.resolve(ContainerRegistrationKeys.QUERY);

	const { data: priceLists } = (await query.graph({
		entity: 'price_list',
		fields: [
			'*',
			'prices.*',
			'prices.price_set.*',
			'prices.price_set.variant.*',
			'price_list_custom.*',
			'price_list_custom.price_list_variants.*',
		],
		filters: {
			starts_at: { $lte: new Date() },
			ends_at: { $gte: new Date() },
			status: 'active',
		},
	})) as unknown as {
		data: (PriceListDTO & {
			price_list_custom: PriceListCustom;
		})[];
	};

	const currentFlashSale = priceLists.find(
		(pl) => pl.price_list_custom?.is_flash_sale,
	);

	if (!currentFlashSale) {
		return products;
	}

	const prices = currentFlashSale.prices;
	const flashSaleProductIds = prices.map((p) => {
		const priceSet = p.price_set as any;
		return priceSet?.variant?.product_id;
	});
	const productIds = [...new Set(flashSaleProductIds)];
	const priceListVariants =
		currentFlashSale?.price_list_custom?.price_list_variants || [];

	for await (const product of products) {
		const isFlashSale = productIds.includes(product.id);
		product.is_flash_sale = isFlashSale;
		product.flash_sale = null;
		if (!isFlashSale) {
			continue;
		}

		const variantIds = product.variants.map((v) => v.id);
		const _priceListVariants = priceListVariants.filter((plv) =>
			variantIds.includes(plv.product_variant_id),
		);

		const quantity = _priceListVariants.reduce(
			(acc, plv) => acc + plv.quantity,
			0,
		);
		const reserved_quantity = _priceListVariants.reduce(
			(acc, plv) => acc + plv.reserved_quantity,
			0,
		);
		product.flash_sale = {
			...currentFlashSale,
			prices: undefined,
			price: undefined,
			price_list_custom: undefined,
			reserved_quantity,
			quantity,
		};
	}

	return products;
};

export const getChildrenCategoryIds = async ({
	container,
	categoryIds,
}: {
	container: MedusaContainer;
	categoryIds: string[];
}): Promise<string[]> => {
	const query = container.resolve(ContainerRegistrationKeys.QUERY);

	const { data: categories } = await query.graph({
		entity: 'product_category',
		fields: ['*'],
		filters: {
			parent_category_id: {
				$in: categoryIds,
			},
		},
	});

	const childrenIds = categories.map((category) => category.id);
	if (childrenIds.length) {
		const _childrenIds = await getChildrenCategoryIds({
			container,
			categoryIds: childrenIds,
		});
		return [...childrenIds, ..._childrenIds];
	}

	return childrenIds;
};

export const removeServiceProducts = async (
	req: MedusaRequest,
	products: ProductDTO[],
) => {
	const productModuleService: IProductModuleService = req.scope.resolve(
		Modules.PRODUCT,
	);

	//ex: Samsung care+
	const serviceProductId = await productModuleService
		.listProductTypes(
			{
				value: 'Service',
			},
			{ take: 1 },
		)
		.then((productTypes) => productTypes[0]?.id);

	if (!serviceProductId) return products;

	return products.filter((product) => serviceProductId !== product.type_id);
};

export const mapProductAttributes = async (
	req: MedusaRequest,
	products: ProductWithAttribute[],
) => {
	const productAttributeService: ProductAttributeService = req.scope.resolve(
		PRODUCT_ATTRIBUTE_MODULE,
	);

	const attributes = await productAttributeService.listProductAttributes(
		{
			status: true,
		},
		{
			relations: ['options'],
		},
	);

	const attributeCodes = attributes.map((attr) => attr.code);

	for await (const product of products) {
		if (!product.metadata) continue;

		for (const attrKey in product.metadata) {
			if (!attributeCodes.includes(attrKey)) continue;

			const productAttribute = attributes.find(
				(productAttribute) => productAttribute.code === attrKey,
			);

			const option = productAttribute?.options?.find(
				(option) => option.value === product.metadata[attrKey],
			);
			productAttribute.options = undefined;

			if (!product.product_attributes) {
				product.product_attributes = [];
			}
			if (option) {
				product.product_attributes.push({
					...productAttribute,
					option,
				});
			}
		}
	}

	return products;
};

export const cleanUpProducts = (products: ProductDTO[]) => {
	for (const product of products) {
		//remove related_products in metadata
		if (product.metadata) {
			product.metadata.related_products = undefined;
		}

		//return image only first one
		if (product.images.length > 0) {
			product.images = [product.images[0]];
		}

		if (product.collection) {
			product.collection = undefined;
		}
	}

	return products;
};

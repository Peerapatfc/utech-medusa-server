import type { PaymentRestrictionRule } from '@customTypes/payment-restriction';
import type {
	AuthContext,
	MedusaRequest,
	MedusaResponse,
} from '@medusajs/framework/http';
import type {
	CartDTO,
	CartLineItemDTO,
	ICartModuleService,
	IProductModuleService,
	RemoteQueryFunction,
} from '@medusajs/framework/types';
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils';
import { PAYMENT_RESTRICTION_MODULE } from '../../../../../../modules/payment-restriction';
import type PaymentRestrictionModuleService from '../../../../../../modules/payment-restriction/service';

interface CustomMedusaRequest extends MedusaRequest {
	auth_context: AuthContext;
}

interface CustomCartDTO extends CartDTO {
	metadata: { pickup_option: { slug: string }; [key: string]: unknown };
}

export const GET = async (req: CustomMedusaRequest, res: MedusaResponse) => {
	try {
		const { id } = req.params;
		const productService: IProductModuleService = req.scope.resolve(
			Modules.PRODUCT,
		);
		const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
		const cartService: ICartModuleService = req.scope.resolve(Modules.CART);
		const cart = (await cartService.retrieveCart(id, {
			select: ['id', 'region_id', 'total', 'subtotal', 'metadata'],
			relations: ['items'],
		})) as CustomCartDTO;

		const { data: payment_providers = [] } = await query.graph({
			entity: 'region_payment_provider',
			filters: {
				region_id: cart.region_id,
			},
			fields: ['payment_provider_id'],
			pagination: {
				take: 999,
				skip: 0,
			},
		});

		const paymentRestrictionsModuleService: PaymentRestrictionModuleService =
			req.scope.resolve(PAYMENT_RESTRICTION_MODULE);
		const payment_restrictions =
			await paymentRestrictionsModuleService.listPaymentRestrictionModels(
				{ is_active: true },
				{
					relations: [
						'payment_restriction_rules',
						'payment_restriction_rules.payment_restriction_rule_values',
					],
					take: 999,
					skip: 0,
					order: {
						created_at: 'DESC',
					},
				},
			);

		const new_payment_providers: Record<string, string | boolean>[] = [];
		await Promise.all(
			payment_providers.map(async (provider) => {
				let countInCondition = 0;
				const hasProviders = payment_restrictions.filter((restriction) =>
					restriction.payment_providers.includes(provider.payment_provider_id),
				);
				await Promise.all(
					hasProviders.map(async (restriction) => {
						let countInRule = 0;
						await Promise.all(
							// biome-ignore lint/suspicious/noExplicitAny: <explanation>
							restriction.payment_restriction_rules.map(async (rule: any) => {
								const values = rule.payment_restriction_rule_values.map(
									(value) => value.value,
								);
								const inCondition = await checkInCondition({
									productService,
									query,
									cart,
									rule,
									values,
								});
								if (
									[
										'eq',
										'in',
										'gt',
										'lt',
										'eq_gt',
										'eq_lt',
										'in_only',
									].includes(rule.operator) &&
									inCondition
								) {
									countInRule = countInRule + 1;
								} else if (rule.operator === 'ne' && !inCondition) {
									countInRule = countInRule + 1;
								}
							}),
						);
						if (countInRule === restriction.payment_restriction_rules.length) {
							countInCondition = countInCondition + 1;
						}
					}),
				);

				if (countInCondition === 0) {
					new_payment_providers.push({
						id: provider.payment_provider_id,
						is_enabled: true,
					});
				}
			}),
		);

		res.json({
			payment_providers: new_payment_providers,
		});
	} catch (err) {
		res.status(500).json({
			message: err.message,
		});
	}
};

const checkInCondition = async ({
	productService,
	query,
	cart,
	rule,
	values,
}: {
	productService: IProductModuleService;
	query: Omit<RemoteQueryFunction, symbol>;
	cart: CustomCartDTO;
	rule: PaymentRestrictionRule;
	values: string[];
}): Promise<boolean> => {
	const firstValue = values[0] ?? 0;
	let inCondition = false;
	if (rule.attribute === 'items.product.id') {
		inCondition =
			cart.items.filter((item) => values.includes(item.product_id)).length > 0;
	} else if (rule.attribute === 'items.product.categories.id') {
		const productIds = await getProductIdsByCategoryIds(productService, values);
		inCondition =
			cart.items.filter((item) => productIds.includes(item.product_id)).length >
			0;
	} else if (rule.attribute === 'items.product.collection_id') {
		const product_collections = await getProductCollectionsByCollectionIds(
			query,
			values,
		);
		const collectionTitles = product_collections.map(
			(collection) => collection.title,
		);
		inCondition =
			cart.items.filter((item) =>
				collectionTitles.includes(item.product_collection),
			).length > 0;
	} else if (rule.attribute === 'items.product.type_id') {
		inCondition =
			cart.items.filter((item) => values.includes(item.product_type_id))
				.length > 0;
	} else if (rule.attribute === 'items.product.tags.id') {
		const productIds = cart.items.map((item) => item.product_id);
		const tagProductPairs = await getTagIdsByProductIds(
			productService,
			cart.items,
			productIds,
			values,
		);
		inCondition =
			tagProductPairs.filter((pair) => values.includes(pair.tagId)).length > 0;

		if (rule.operator === 'eq') {
			const productsWithTags = new Set(
				tagProductPairs.map((pair) => pair.productId),
			);

			inCondition = productIds.every(
				(productId) =>
					productsWithTags.has(productId) &&
					tagProductPairs.some(
						(pair) =>
							pair.productId === productId && values.includes(pair.tagId),
					),
			);
		} else if (rule.operator === 'ne') {
			inCondition = cart.items.length === tagProductPairs.length;
		}
	} else if (
		rule.attribute === 'cart.sub_total' ||
		rule.attribute === 'cart.total'
	) {
		const number =
			rule.attribute === 'cart.sub_total' ? cart.subtotal : cart.total;
		if (rule.operator === 'eq' && firstValue === number) {
			inCondition = true;
		} else if (rule.operator === 'gt' && number > firstValue) {
			inCondition = true;
		} else if (rule.operator === 'lt' && number < firstValue) {
			inCondition = true;
		} else if (rule.operator === 'eq_gt' && number >= firstValue) {
			inCondition = true;
		} else if (rule.operator === 'eq_lt' && number <= firstValue) {
			inCondition = true;
		}
	} else if (rule.attribute === 'cart.metadata.pickup_option.slug') {
		const cartPickup = cart.metadata?.pickup_option?.slug;
		if (!cartPickup) return false;
		if (values?.length === 0) return false;
		inCondition = values.includes(cartPickup);
	} else if (rule.attribute === 'product.variant.id') {
		if (rule.operator === 'in_only') {
			const allItemsInValues = cart.items.every((item) =>
				values.includes(item.variant_id),
			);
			inCondition = allItemsInValues;
		} else {
			inCondition =
				cart.items.filter((item) => values.includes(item.variant_id)).length >
				0;
		}
	}
	return inCondition;
};

const getProductIdsByCategoryIds = async (
	productService: IProductModuleService,
	categoryIds: string[],
): Promise<string[]> => {
	const categories = await productService.listProductCategories(
		{
			id: categoryIds,
		},
		{
			relations: ['products'],
			take: 999,
			skip: 0,
		},
	);
	const productIds: string[] = [];
	categories.map((category) => {
		category.products.map((product) => {
			productIds.push(product.id);
		});
	});
	return productIds;
};

const getProductCollectionsByCollectionIds = async (
	query: Omit<RemoteQueryFunction, symbol>,
	collectionIds: string[],
) => {
	const { data: product_collections = [] } = await query.graph({
		entity: 'product_collection',
		fields: ['id', 'title', 'handle'],
		filters: {
			id: {
				$in: collectionIds,
			},
		},
		pagination: {
			take: 999,
			skip: 0,
		},
	});
	return product_collections;
};

const getTagIdsByProductIds = async (
	productService: IProductModuleService,
	cartItems: CartLineItemDTO[],
	productIds: string[],
	tagIds: string[],
): Promise<{ tagId: string; productId: string; variantId: string }[]> => {
	const tagProductPairs: {
		tagId: string;
		productId: string;
		variantId: string;
	}[] = [];

	// Fetch all products at once for efficiency
	const products = await productService.listProducts(
		{
			id: productIds,
		},
		{
			relations: ['tags', 'variants'],
			take: 999,
			skip: 0,
		},
	);

	// Create a map of productId to product for quick lookup
	const productMap = products.reduce((acc, product) => {
		acc[product.id] = product;
		return acc;
	}, {});

	// Process each cart item
	for (const item of cartItems) {
		const product = productMap[item.product_id];

		if (product?.tags) {
			// For each tag in the product, check if it's in our target tagIds
			for (const tag of product.tags) {
				if (tagIds.includes(tag.id)) {
					tagProductPairs.push({
						tagId: tag.id,
						productId: product.id,
						variantId: item.variant_id,
					});
				}
			}
		}
	}

	return tagProductPairs;
};

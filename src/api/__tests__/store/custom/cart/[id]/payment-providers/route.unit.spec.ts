// @ts-nocheck - Disable type checking for tests
/**
 * Unit tests for the payment providers route
 * Testing the functionality of retrieving available payment providers for a cart
 * with consideration for payment restrictions based on various cart attributes.
 */
import type { MedusaResponse } from '@medusajs/framework/http';
import type {
	ICartModuleService,
	IProductModuleService,
} from '@medusajs/framework/types';
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils';
import { PAYMENT_RESTRICTION_MODULE } from '../../../../../../../modules/payment-restriction';
import { GET } from '../../../../../../store/custom/cart/[id]/payment-providers/route';

// Define interfaces for proper typing
interface AuthContext {
	user_id?: string;
	customer_id?: string;
}

interface CustomMedusaRequest {
	params: { id: string };
	scope: {
		resolve: jest.Mock;
	};
	auth_context: AuthContext;
}

// Define interfaces for our mock services
interface MockCartService {
	retrieveCart: jest.Mock;
}

interface MockQueryService {
	graph: jest.Mock;
}

interface MockProductService {
	listProductCategories: jest.Mock;
	listProducts: jest.Mock;
}

interface MockPaymentRestrictionService {
	listPaymentRestrictionModels: jest.Mock;
}

// Mock data constants
const MOCK_IDS = {
	cart: 'cart_123',
	region: 'region_123',
	product: 'product_123',
	variant: 'variant_123',
	category: 'category_123',
	collection: 'collection_123',
	tag: 'tag_123',
	paymentProvider: 'payment_provider_123',
	productType: 'type_123',
};

// Standard cart object used across most tests
const DEFAULT_CART = {
	id: MOCK_IDS.cart,
	region_id: MOCK_IDS.region,
	total: 1000,
	subtotal: 800,
	metadata: { pickup_option: { slug: 'store-pickup' } },
	items: [
		{
			product_id: MOCK_IDS.product,
			variant_id: MOCK_IDS.variant,
			product_collection: 'Test Collection',
			product_type_id: MOCK_IDS.productType,
		},
	],
};

describe('GET /store/custom/cart/[id]/payment-providers', () => {
	// Test variables
	let req: CustomMedusaRequest;
	let res: MedusaResponse;

	// Mock services with proper typing
	let mockCartService: MockCartService;
	let mockQueryService: MockQueryService;
	let mockProductService: MockProductService;
	let mockPaymentRestrictionService: MockPaymentRestrictionService;

	beforeEach(() => {
		// Initialize mock services for each test
		mockCartService = {
			retrieveCart: jest.fn().mockResolvedValue(DEFAULT_CART),
		};

		mockQueryService = {
			graph: jest.fn().mockImplementation(({ entity }) => {
				if (entity === 'region_payment_provider') {
					return Promise.resolve({
						data: [{ payment_provider_id: MOCK_IDS.paymentProvider }],
					});
				}
				if (entity === 'product_collection') {
					return Promise.resolve({
						data: [
							{
								id: MOCK_IDS.collection,
								title: 'Test Collection',
								handle: 'test-collection',
							},
						],
					});
				}
				return Promise.resolve({ data: [] });
			}),
		};

		mockProductService = {
			listProductCategories: jest.fn().mockResolvedValue([
				{
					id: MOCK_IDS.category,
					products: [{ id: MOCK_IDS.product }],
				},
			]),
			listProducts: jest.fn().mockResolvedValue([
				{
					id: MOCK_IDS.product,
					tags: [{ id: MOCK_IDS.tag }],
					variants: [{ id: MOCK_IDS.variant }],
				},
			]),
		};

		mockPaymentRestrictionService = {
			listPaymentRestrictionModels: jest.fn().mockResolvedValue([
				{
					payment_providers: ['different_payment_provider'],
					payment_restriction_rules: [],
				},
			]),
		};

		// Setup request object
		req = {
			params: { id: MOCK_IDS.cart },
			scope: {
				resolve: jest.fn().mockImplementation((module) => {
					if (module === Modules.CART) return mockCartService;
					if (module === Modules.PRODUCT) return mockProductService;
					if (module === PAYMENT_RESTRICTION_MODULE)
						return mockPaymentRestrictionService;
					if (module === ContainerRegistrationKeys.QUERY)
						return mockQueryService;
					return mockQueryService;
				}),
			},
			auth_context: {},
		} as CustomMedusaRequest;

		// Setup response object
		res = {
			json: jest.fn(),
			status: jest.fn().mockReturnThis(),
		} as unknown as MedusaResponse;
	});

	/**
	 * Helper function to create a payment restriction rule
	 * @param attribute - The attribute to apply the restriction to
	 * @param operator - The operator to use for the restriction
	 * @param value - The value(s) to use in the restriction
	 * @returns A payment restriction rule object
	 */
	const createRestrictionRule = (
		attribute: string,
		operator: string,
		value: string | number | string[],
	) => ({
		attribute,
		operator,
		payment_restriction_rule_values: Array.isArray(value)
			? value.map((v) => ({ value: v }))
			: [{ value }],
	});

	/**
	 * Helper function to setup a payment restriction
	 * @param rules - The rules to apply for the restriction
	 */
	const setupPaymentRestriction = (
		rules: ReturnType<typeof createRestrictionRule>[],
	) => {
		mockPaymentRestrictionService.listPaymentRestrictionModels.mockResolvedValueOnce(
			[
				{
					payment_providers: [MOCK_IDS.paymentProvider],
					payment_restriction_rules: rules,
				},
			],
		);
	};

	// Test cases
	describe('Basic functionality', () => {
		it('should return payment providers when no restrictions apply', async () => {
			// Act
			await GET(req, res);

			// Assert
			expect(res.json).toHaveBeenCalledWith({
				payment_providers: [{ id: MOCK_IDS.paymentProvider, is_enabled: true }],
			});
		});

		it('should handle error and return 500 status', async () => {
			// Arrange
			mockCartService.retrieveCart.mockRejectedValueOnce(
				new Error('Test error'),
			);

			// Act
			await GET(req, res);

			// Assert
			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.json).toHaveBeenCalledWith({ message: 'Test error' });
		});
	});

	describe('API response edge cases', () => {
		it('should handle API responses with missing or empty data', async () => {
			// Test case 1: undefined data in region_payment_provider
			mockQueryService.graph.mockImplementation(({ entity }) => {
				if (entity === 'region_payment_provider') {
					return Promise.resolve({}); // No data property
				}
				return Promise.resolve({ data: [] });
			});

			await GET(req, res);
			expect(res.json).toHaveBeenCalledWith({ payment_providers: [] });

			// Test case 2: empty data in product_collection
			mockQueryService.graph.mockImplementation(({ entity }) => {
				if (entity === 'region_payment_provider') {
					return Promise.resolve({
						data: [{ payment_provider_id: MOCK_IDS.paymentProvider }],
					});
				}
				if (entity === 'product_collection') {
					return Promise.resolve({}); // No data property
				}
				return Promise.resolve({ data: [] });
			});

			setupPaymentRestriction([
				createRestrictionRule(
					'items.product.collection_id',
					'eq',
					MOCK_IDS.collection,
				),
			]);

			await GET(req, res);
			expect(res.json).toHaveBeenCalledWith({
				payment_providers: [{ id: MOCK_IDS.paymentProvider, is_enabled: true }],
			});
		});
	});

	describe('Product-based restrictions', () => {
		const productAttributes = [
			{
				name: 'product ID',
				attribute: 'items.product.id',
				value: MOCK_IDS.product,
			},
			{
				name: 'product category',
				attribute: 'items.product.categories.id',
				value: MOCK_IDS.category,
			},
			{
				name: 'product collection',
				attribute: 'items.product.collection_id',
				value: MOCK_IDS.collection,
			},
			{
				name: 'product tag',
				attribute: 'items.product.tags.id',
				value: MOCK_IDS.tag,
			},
			{
				name: 'product type',
				attribute: 'items.product.type_id',
				value: MOCK_IDS.productType,
			},
		];

		// Test each product attribute with 'eq' operator
		for (const { name, attribute, value } of productAttributes) {
			it(`should handle restrictions based on ${name}`, async () => {
				// Arrange
				setupPaymentRestriction([
					createRestrictionRule(attribute, 'eq', value),
				]);

				// Act
				await GET(req, res);

				// Assert
				expect(res.json).toHaveBeenCalledWith({ payment_providers: [] });
			});
		}

		// Test 'ne' operator
		it("should handle restrictions with 'ne' operator", async () => {
			// Arrange
			setupPaymentRestriction([
				createRestrictionRule(
					'items.product.tags.id',
					'ne',
					'different_tag_id',
				),
			]);

			// Act
			await GET(req, res);

			// Assert
			expect(res.json).toHaveBeenCalledWith({ payment_providers: [] });
		});

		// Test the case when no products are found
		it('should handle the case when no products are found for category', async () => {
			// Arrange
			mockProductService.listProductCategories.mockResolvedValueOnce([
				{
					id: 'empty_category',
					products: [], // No products in this category
				},
			]);

			setupPaymentRestriction([
				createRestrictionRule(
					'items.product.categories.id',
					'eq',
					'empty_category',
				),
			]);

			// Act
			await GET(req, res);

			// Assert
			expect(res.json).toHaveBeenCalledWith({
				payment_providers: [{ id: MOCK_IDS.paymentProvider, is_enabled: true }],
			});
		});
	});

	describe('Cart-based restrictions', () => {
		const operators = [
			{ name: 'greater than', op: 'gt', value: '500' },
			{ name: 'equal to', op: 'eq', value: 1000 },
			{ name: 'equal or greater than', op: 'eq_gt', value: '1000' },
			{ name: 'equal or less than', op: 'eq_lt', value: '1000' },
		];

		// Test cart.total with different operators
		for (const { name, op, value } of operators) {
			it(`should handle cart total restrictions with ${name} (${op}) operator`, async () => {
				// Arrange
				setupPaymentRestriction([
					createRestrictionRule('cart.total', op, value),
				]);

				// Act
				await GET(req, res);

				// Assert
				expect(res.json).toHaveBeenCalledWith({ payment_providers: [] });
			});
		}

		// Test cart.sub_total (different attribute but same logic)
		it('should handle cart subtotal restrictions', async () => {
			// Arrange
			setupPaymentRestriction([
				createRestrictionRule('cart.sub_total', 'lt', '1000'),
			]);

			// Act
			await GET(req, res);

			// Assert
			expect(res.json).toHaveBeenCalledWith({ payment_providers: [] });
		});
	});

	describe('Pickup option restrictions', () => {
		it('should handle pickup option restrictions and edge cases', async () => {
			// Test case 1: Normal pickup option restriction
			setupPaymentRestriction([
				createRestrictionRule(
					'cart.metadata.pickup_option.slug',
					'eq',
					'store-pickup',
				),
			]);

			await GET(req, res);
			expect(res.json).toHaveBeenCalledWith({ payment_providers: [] });

			// Test case 2: Missing pickup option
			mockCartService.retrieveCart.mockResolvedValueOnce({
				...DEFAULT_CART,
				metadata: {}, // Missing pickup_option
			});

			setupPaymentRestriction([
				createRestrictionRule(
					'cart.metadata.pickup_option.slug',
					'eq',
					'store-pickup',
				),
			]);

			await GET(req, res);
			expect(res.json).toHaveBeenCalledWith({
				payment_providers: [{ id: MOCK_IDS.paymentProvider, is_enabled: true }],
			});

			// Test case 3: Empty values array
			setupPaymentRestriction([
				{
					attribute: 'cart.metadata.pickup_option.slug',
					operator: 'eq',
					payment_restriction_rule_values: [], // Empty values array
				},
			]);

			await GET(req, res);
			expect(res.json).toHaveBeenCalledWith({
				payment_providers: [{ id: MOCK_IDS.paymentProvider, is_enabled: true }],
			});
		});
	});

	describe('Variant-based restrictions', () => {
		it('should handle variant ID restrictions with different operators', async () => {
			// Test 'in' operator
			setupPaymentRestriction([
				createRestrictionRule('product.variant.id', 'in', MOCK_IDS.variant),
			]);

			await GET(req, res);
			expect(res.json).toHaveBeenCalledWith({ payment_providers: [] });

			// Test 'in_only' operator
			setupPaymentRestriction([
				createRestrictionRule(
					'product.variant.id',
					'in_only',
					MOCK_IDS.variant,
				),
			]);

			await GET(req, res);
			expect(res.json).toHaveBeenCalledWith({ payment_providers: [] });
		});
	});
});

import { container } from '@medusajs/framework';
import type {
	CalculatedShippingOptionPrice,
	CreateFulfillmentResult,
	CreateShippingOptionDTO,
	FulfillmentOption,
	IProductModuleService,
	Logger,
	StoreCart,
} from '@medusajs/framework/types';
import {
	AbstractFulfillmentProviderService,
	Modules,
} from '@medusajs/framework/utils';

interface InjectedDependencies {
	logger: Logger;
}

interface Options {
	apiKey: string;
}

interface Category {
	id: string;
	parent_category_id: string | null;
	metadata?: {
		shipping_rate?: string;
	};
}

interface CustomCalculatedShippingOptionPrice
	extends CalculatedShippingOptionPrice {
	has_shipping_rate: boolean;
}

class FulfillmentCalculateProviderService extends AbstractFulfillmentProviderService {
	static identifier = 'fulfillment-calculate';
	private readonly logger: Logger;
	private readonly options: Options;
	private readonly DEFAULT_SHIPPING_RATE = null;

	constructor({ logger }: InjectedDependencies, options: Options) {
		super();
		this.logger = logger;
		this.options = options;
	}

	async getFulfillmentOptions(): Promise<FulfillmentOption[]> {
		return [{ id: 'standard' }, { id: 'return', is_return: true }];
	}

	async validateFulfillmentData(
		optionData: Record<string, unknown>,
		data: Record<string, unknown>,
		context: Record<string, unknown>,
	): Promise<Record<string, unknown>> {
		return data;
	}

	async validateOption(data: Record<string, unknown>): Promise<boolean> {
		return true;
	}

	async canCalculate(data: CreateShippingOptionDTO): Promise<boolean> {
		return true;
	}

	private async findShippingRateInCategoryHierarchy(
		category: Category,
		productModuleService: IProductModuleService,
	): Promise<number | null> {
		let currentCategory = category;
		let maxRate = currentCategory?.metadata?.shipping_rate ?? null;

		while (currentCategory.parent_category_id) {
			const [parentCategory] = await productModuleService.listProductCategories(
				{
					id: [currentCategory.parent_category_id],
				},
				{
					select: ['id', 'parent_category_id', 'metadata'],
					take: 1,
				},
			);

			if (!parentCategory) {
				break;
			}

			currentCategory = parentCategory;

			if (currentCategory.metadata?.shipping_rate) {
				const rate = currentCategory.metadata.shipping_rate;
				maxRate =
					maxRate !== null
						? Math.max(Number(maxRate), Number(rate)).toString()
						: rate;
			}
		}

		return maxRate !== null ? Number(maxRate) : null;
	}

	private async getMaxShippingRate(
		items: StoreCart['items'],
		productModuleService: IProductModuleService,
	): Promise<number> {
		if (!items?.length) {
			return this.DEFAULT_SHIPPING_RATE;
		}

		let tempMaxShippingRate = this.DEFAULT_SHIPPING_RATE;
		let hasFoundAnyShippingRate = false;
		let hasNullRate = false;

		for (const item of items) {
			const productId = item.product_id;

			if (!productId) {
				continue;
			}

			const [product] = await productModuleService.listProducts(
				{ id: [productId] },
				{ relations: ['categories'] },
			);

			if (!product?.categories?.length) {
				continue;
			}

			let foundRateForItem = false;

			for (const category of product.categories) {
				const shippingRate = await this.findShippingRateInCategoryHierarchy(
					category,
					productModuleService,
				);

				if (shippingRate !== null) {
					tempMaxShippingRate = hasFoundAnyShippingRate
						? Math.max(tempMaxShippingRate, shippingRate)
						: shippingRate;
					hasFoundAnyShippingRate = true;
					foundRateForItem = true;
					break;
				}
			}

			if (!foundRateForItem) {
				hasNullRate = true;
			}
		}

		return hasNullRate ? null : tempMaxShippingRate;
	}

	async calculatePrice(
		optionData: Record<string, unknown>,
		data: Record<string, unknown>,
		context: Record<string, unknown>,
	): Promise<CustomCalculatedShippingOptionPrice> {
		const productModuleService = container.resolve<IProductModuleService>(
			Modules.PRODUCT,
		);
		const items = context.items as StoreCart['items'];

		if (!items?.length) {
			return {
				calculated_amount: this.DEFAULT_SHIPPING_RATE,
				is_calculated_price_tax_inclusive: false,
				has_shipping_rate: false,
			};
		}

		const maxShippingRate = await this.getMaxShippingRate(
			items,
			productModuleService,
		);

		return {
			calculated_amount: maxShippingRate,
			is_calculated_price_tax_inclusive: false,
			has_shipping_rate: maxShippingRate !== null,
		};
	}

	async createFulfillment(
		data: Record<string, unknown>,
		items: Record<string, unknown>[],
		order: Record<string, unknown>,
		fulfillment: Record<string, unknown>,
	): Promise<CreateFulfillmentResult> {
		return {
			data: {
				...data,
			},
			labels: [],
		};
	}

	async cancelFulfillment(fulfillment: Record<string, unknown>): Promise<void> {
		// Implementation for cancellation logic
	}
}

export default FulfillmentCalculateProviderService;

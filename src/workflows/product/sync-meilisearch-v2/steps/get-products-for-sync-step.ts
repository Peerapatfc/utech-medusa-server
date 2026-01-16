import {
	IProductModuleService,
	MedusaContainer,
	QueryContextType,
	RemoteQueryFilters,
} from '@medusajs/framework/types';
import {
	ContainerRegistrationKeys,
	Modules,
	ProductStatus,
	QueryContext,
} from '@medusajs/framework/utils';
import { createStep, StepResponse } from '@medusajs/framework/workflows-sdk';
import { WorkflowInput } from '..';
import { ProductQuery } from '../type';

const fields = [
	'id',
	'title',
	'handle',
	'status',
	'thumbnail',
	'type_id',
	'metadata',
	'sales_channels.id',
	'variants.id',
	'variants.title',
	'variants.sku',
	'variants.calculated_price.*',
	'categories.id',
	'categories.name',
	'categories.mpath',
];

export const getProductsStep = createStep(
	'get-products-for-sync-step',
	async ({ productIds, syncAll }: WorkflowInput, { container }) => {
		const regionService = container.resolve(Modules.REGION);
		const query = container.resolve(ContainerRegistrationKeys.QUERY);

		const queryContext: QueryContextType = {};

		const region = await regionService
			.listRegions({
				currency_code: 'thb',
			})
			.then((regions) => regions[0]);

		if (region) {
			queryContext.variants = {
				calculated_price: QueryContext({
					region_id: region.id,
					currency_code: 'thb',
				}),
			};
		}

		const filters: RemoteQueryFilters<'product'> = {
			status: ProductStatus.PUBLISHED,
		};

		if (!syncAll && productIds && productIds.length > 0) {
			filters.id = productIds;
		}

		const { data: products } = (await query.graph({
			entity: 'product',
			fields,
			filters,
			pagination: {
				take: 2000,
				skip: 0,
			},
			context: queryContext,
		})) as unknown as {
			data: ProductQuery[];
		};

		// Remove service products
		const filteredProducts = await removeServiceProducts(container, products);

		return new StepResponse(filteredProducts);
	},
);

export const removeServiceProducts = async (
	container: MedusaContainer,
	products: ProductQuery[],
) => {
	const productModuleService: IProductModuleService = container.resolve(
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

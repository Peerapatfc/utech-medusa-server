import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import type PriceListCustomModuleService from '../../../../../../modules/price-list-custom/service';

export async function POST(
	req: MedusaRequest<{
		price_list_id: string;
		product_update: {
			id: string;
			rank: number;
		}[];
	}>,
	res: MedusaResponse,
) {
	const { price_list_id, product_update } = req.body;

	if (!product_update || product_update.length === 0) return res.status(400);

	const priceListCustomModuleService: PriceListCustomModuleService =
		req.scope.resolve('priceListCustomModuleService');

	try {
		const priceListCustom =
			await priceListCustomModuleService.retrievePriceListCustom(price_list_id);

		if (!priceListCustom) return res.status(201);
		const productObject = priceListCustom.products as unknown as {
			id: string;
			rank: number;
		}[];

		const updateProduct = productObject.map((itemA) => {
			const matchingItemB = product_update.find(
				(itemB) => itemB.id === itemA.id,
			);
			return matchingItemB ? { ...itemA, rank: matchingItemB.rank } : itemA;
		});

		const sortedProducts = updateProduct.sort((a, b) => a.rank - b.rank);

		const result = await priceListCustomModuleService.updatePriceListCustoms([
			{
				id: price_list_id,
				products: sortedProducts as unknown as Record<string, unknown>,
			},
		]);

		return res.status(200).json({ productObject, sortedProducts, result });
	} catch (error) {
		console.error('Error updating product order:', error);
		return res.status(500).json({ error: 'Internal server error' });
	}
}

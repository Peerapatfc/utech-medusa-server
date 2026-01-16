import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { parseFilterParams } from './helpers';
import buildProductFilterConfigV2 from '../../../../workflows/product/build-product-filter-config-v2';

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
	const category = req.query.category as string;
	const product_ids = req.query.product_ids as string;
	const brand_id = req.query.brand_id as string;
	const collection_id = req.query.collection_id as string;
	const show_available_only = req.query.show_available_only === 'true';

	// Extract current filter state from query parameters
	const filters = parseFilterParams(
		req.query as Record<string, string | string[]>,
	);

	try {
		const { result, errors } = await buildProductFilterConfigV2(req.scope).run({
			input: {
				category_id: category,
				brand_id,
				product_ids: product_ids ? product_ids.split(',') : [],
				collection_id,
				show_available_only,
				filters,
			},
		});

		if (errors.length) {
			return res.json({
				errors: errors.map((error) => error.error),
			});
		}

		res.json({
			data: result.mappedFilterConfig,
		});
	} catch (error) {
		res.status(500).json({
			message: error.message,
		});
	}
};

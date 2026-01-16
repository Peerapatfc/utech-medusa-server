import type {
	MedusaRequest,
	MedusaResponse,
	AuthContext,
} from '@medusajs/framework/http';
import { generateJwtToken, Modules } from '@medusajs/framework/utils';
import type { IProductModuleService } from '@medusajs/framework/types';

interface CustomMedusaRequest extends MedusaRequest {
	auth_context: AuthContext;
}

export async function GET(req: CustomMedusaRequest, res: MedusaResponse) {
	const admin = req.auth_context;
	const collection = req.query.collection as string;
	const collection_id = req.query.collection_id as string;

	if (!admin?.actor_id) {
		return res.status(401).json({
			message: 'Unauthorized',
			user: req.user || null,
			auth_context: admin || null,
		});
	}

	const STRAPI_URL = process.env.STRAPI_URL;
	if (!STRAPI_URL) {
		return res
			.status(500)
			.json({ message: 'STRAPI_URL is not defined in .env' });
	}

	const JWT_SECRET = process.env.JWT_SECRET;
	if (!JWT_SECRET) {
		return res
			.status(500)
			.json({ message: 'JWT_SECRET is not defined in .env' });
	}

	const productService: IProductModuleService = req.scope.resolve(
		Modules.PRODUCT,
	);
	let message = 'This is strapi generated link.';
	let isLink = true;
	const params = new URLSearchParams({
		collection: '',
		collection_id: '',
	});

	if (collection === 'product-category') {
		const category = await productService.retrieveProductCategory(
			collection_id,
			{ select: ['*'] },
		);
		if (category?.metadata?.strapi_id) {
			params.set('collection', collection);
			params.set('collection_id', String(category.metadata.strapi_id));
		} else {
			message = 'This product categories unsync to strapi.';
			isLink = false;
		}
	} else if (collection === 'blog') {
		params.set('collection', collection);
	} else if (collection === 'product') {
		const product = await productService.retrieveProduct(collection_id);
		if (product?.metadata?.strapi_id) {
			params.set('collection', collection);
			params.set('collection_id', String(product.metadata.strapi_id));
		} else {
			message = 'This product unsync to strapi.';
			isLink = false;
		}
	} else {
		params.set('collection', collection);
		params.set('collection_id', collection_id);
	}

	const token = generateJwtToken(
		{ actor_id: admin.actor_id },
		{
			secret: JWT_SECRET,
			expiresIn: '1d',
		},
	);

	const link = `${STRAPI_URL}/api/teleport?token=${token}&${params.toString()}`;

	return res.json({
		message,
		link: isLink ? link : null,
		token,
	});
}

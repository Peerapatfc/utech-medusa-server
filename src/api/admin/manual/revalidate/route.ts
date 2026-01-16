import { MedusaRequest, MedusaResponse } from '@medusajs/framework';
import StorefrontModuleService from '../../../../modules/storefront/service';
import { STOREFRONT_MODULE } from '../../../../modules/storefront';

type RevalidateTagsDTO = {
	tags: string[];
};

export const POST = async (
	req: MedusaRequest<RevalidateTagsDTO>,
	res: MedusaResponse,
) => {
	const storefrontService: StorefrontModuleService =
		req.scope.resolve(STOREFRONT_MODULE);

	const tags = req.body.tags;
	if (!tags || !Array.isArray(tags)) {
		return res.status(400).json({ message: 'Invalid tags array' });
	}

	if (tags.length === 0) {
		return res.status(400).json({ message: 'Tags array cannot be empty' });
	}

	const revalidated = await storefrontService.revalidateTags(tags);

	return res
		.status(200)
		.json({ message: 'Revalidation triggered', result: revalidated });
};

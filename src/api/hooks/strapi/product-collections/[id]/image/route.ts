import { MedusaRequest, MedusaResponse } from '@medusajs/framework';
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils';

interface UpdateImageDTO {
	banner: string | null;
}

export const PATCH = async (
	req: MedusaRequest<UpdateImageDTO>,
	res: MedusaResponse,
) => {
	const { id } = req.params;
	const { banner = null } = req.body;
	const productService = req.scope.resolve(Modules.PRODUCT);
	const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER);

	const collection = await productService.retrieveProductCollection(id, {
		select: ['metadata'],
	});
	const currentMetadata = collection.metadata || {};

	const isChanges = currentMetadata.banner !== banner;

	if (!isChanges) {
		logger.info('Collection banner has not changed');
		return res.status(200).json({
			message: 'No changes detected',
		});
	}

	try {
		const newMetadata = {
			...currentMetadata,
			banner,
		};

		const updated = await productService.updateProductCollections(id, {
			metadata: newMetadata,
		});

		return res
			.status(200)
			.json({ message: 'Banner updated successfully', collection: updated });
	} catch (error) {
		logger.error('Failed to update banner', error?.message);
		return res.status(500).json({
			message: 'Failed to update banner',
			error: error?.message,
		});
	}
};

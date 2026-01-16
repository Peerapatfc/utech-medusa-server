import { MedusaRequest, MedusaResponse } from '@medusajs/framework';
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils';

interface UpdateThumbnailDTO {
	icon: string | null;
	thumbnail: string | null;
}

export const PATCH = async (
	req: MedusaRequest<UpdateThumbnailDTO>,
	res: MedusaResponse,
) => {
	const { id } = req.params;
	const { icon = null, thumbnail = null } = req.body;
	const productService = req.scope.resolve(Modules.PRODUCT);
	const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER);

	const category = await productService.retrieveProductCategory(id, {
		select: ['metadata'],
	});
	const currentMetadata = category.metadata || {};

	logger.info(
		`Updating category thumbnail ${id} with thumbnail:${thumbnail}, icon:${icon} >> current thumbnail:${currentMetadata.thumbnail}, icon:${currentMetadata.icon}`,
	);

	const isChanges =
		currentMetadata.icon !== icon || currentMetadata.thumbnail !== thumbnail;

	if (!isChanges) {
		logger.info('Category Thumbnail and Logo have not changed');
		return res.status(200).json({
			message: 'No changes detected',
		});
	}

	try {
		const newMetadata = {
			...currentMetadata,
			icon,
			thumbnail,
		};

		const updated = await productService.updateProductCategories(id, {
			metadata: newMetadata,
		});

		return res
			.status(200)
			.json({ message: 'Thumbnail updated successfully', category: updated });
	} catch (error) {
		logger.error('Failed to update thumbnail', error?.message);
		return res.status(500).json({
			message: 'Failed to update thumbnail',
			error: error?.message,
		});
	}
};

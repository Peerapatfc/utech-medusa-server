import type { Logger } from '@medusajs/framework/types';
import {
	ContainerRegistrationKeys,
	MedusaError,
} from '@medusajs/framework/utils';
import { createStep, StepResponse } from '@medusajs/framework/workflows-sdk';

interface StepInput {
	file_url: string;
	allowed_mime_types: string[];
}

export const validateFileUrlMimetypeStep = createStep(
	'validate-file-url-mimetype-step',
	async ({ file_url, allowed_mime_types }: StepInput, { container }) => {
		const logger: Logger = container.resolve(ContainerRegistrationKeys.LOGGER);

		let contentType = '';

		try {
			const response = await fetch(file_url, { method: 'HEAD' });
			contentType = response.headers.get('content-type');
		} catch (error) {
			const errorMsg = `validate-file-url-mimetype-step: Error fetching URL:${file_url}, error: ${error?.message}`;
			logger.error(errorMsg);
			throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, errorMsg);
		}

		if (!contentType) {
			const errorMsg = `validate-file-url-mimetype-step: No content type found for URL:${file_url}`;
			logger.error(errorMsg);
			throw new MedusaError(MedusaError.Types.NOT_FOUND, errorMsg);
		}

		const isAllowed = allowed_mime_types.includes(contentType);
		if (!isAllowed) {
			const errorMsg = `validate-file-url-mimetype-step: File type not allowed for URL:${file_url}, content-type: ${contentType}, allowed types: ${allowed_mime_types.join(', ')}`;
			logger.error(errorMsg);
			throw new MedusaError(MedusaError.Types.NOT_ALLOWED, errorMsg);
		}

		return new StepResponse({});
	},
);

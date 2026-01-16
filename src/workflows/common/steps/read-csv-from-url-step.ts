import type { Logger } from '@medusajs/framework/types';
import {
	ContainerRegistrationKeys,
	MedusaError,
} from '@medusajs/framework/utils';
import { createStep, StepResponse } from '@medusajs/framework/workflows-sdk';
import { parse } from 'csv-parse/sync';

interface StepInput {
	url: string;
}

export const readCSVFromUrlStep = createStep(
	'read-csv-from-url-step',
	async ({ url }: StepInput, { container }) => {
		const logger: Logger = container.resolve(ContainerRegistrationKeys.LOGGER);
		if (!url) {
			logger.error('URL is required');
			throw new MedusaError(MedusaError.Types.INVALID_DATA, 'URL is required');
		}

		logger.info(`read-csv-step: Reading CSV from ${url}`);

		try {
			const response = await fetch(url);
			if (!response.ok) {
				logger.error(`Error fetching CSV: ${response.statusText}`);
				throw new MedusaError(
					MedusaError.Types.NOT_FOUND,
					`Error fetching CSV: ${response.statusText}`,
				);
			}

			const csvData = await response.text();

			const objData = parse(csvData, {
				columns: true,
				skip_empty_lines: true,
			}) as Record<string, unknown>[];

			logger.info('read-csv-step: CSV read successfully');

			return new StepResponse({
				success: true,
				data: objData,
			});
		} catch (error) {
			logger.error(`Error reading CSV: ${error.message}`);
			throw new MedusaError(MedusaError.Types.INVALID_DATA, error.message);
		}
	},
);

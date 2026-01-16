import { StepResponse, createStep } from '@medusajs/framework/workflows-sdk';
import type { ImportHistory } from '@customTypes/imports';
import type ImportService from '../../../modules/import/service';
import { IMPORT_SERVICE } from '../../../modules/import';

interface StepInput {
	data: ImportHistory;
}

export const saveImportingHistoryStep = createStep(
	'save-importing-history-step',
	async ({ data }: StepInput, { container }) => {
		const importService: ImportService = container.resolve(IMPORT_SERVICE);
		const created = await importService.createImportHistories(data);
		return new StepResponse(created, {
			created,
		});
	},
	async ({ created }, { container }) => {
		const importService: ImportService = container.resolve(IMPORT_SERVICE);
		await importService.softDeleteImportHistories(created.id);
	},
);

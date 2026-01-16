import type { MedusaRequest, MedusaResponse } from '@medusajs/framework';
import validationReportForImportWorkflow from '../../../../workflows/imports/validate-and-report-workflow';
import type { AdminValidateImportType } from './validators';

export const POST = async (
	req: MedusaRequest<AdminValidateImportType>,
	res: MedusaResponse,
) => {
	const { result } = await validationReportForImportWorkflow(req.scope).run({
		input: {
			url: req.validatedBody.url,
			import_type: req.validatedBody.import_type,
		},
	});

	res.status(200).json({
		success: true,
		import_validation: result,
	});
};

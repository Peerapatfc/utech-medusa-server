import type {
	AuthenticatedMedusaRequest,
	MedusaResponse,
} from '@medusajs/framework/http';
import { getDashboardDataInsightsWorkflow } from '../../../../workflows/dashboard/data-insight';

export async function GET(
	req: AuthenticatedMedusaRequest,
	res: MedusaResponse,
): Promise<void> {
	try {
		const { result, errors } = await getDashboardDataInsightsWorkflow(
			req.scope,
		).run();

		if (errors && errors.length > 0) {
			res.status(500).json({ message: 'Workflow execution failed', errors });
			return;
		}

		if (result?.success) {
			res.status(200).json(result.data);
		} else {
			res.status(500).json({
				message: 'Workflow completed but indicated an issue.',
				result,
			});
		}
	} catch (error) {
		console.error('Error invoking getDashboardDataInsightsWorkflow:', error);
		res.status(500).json({
			message: 'Failed to retrieve dashboard insights',
			error: error?.message,
		});
	}
}

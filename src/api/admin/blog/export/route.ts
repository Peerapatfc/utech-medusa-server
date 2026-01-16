import type {
	AuthenticatedMedusaRequest,
	MedusaResponse,
} from '@medusajs/framework/http';
import { getBlogExportWorkflow } from '../../../../workflows/blog/export';
import type { BlogPerformanceQueryParamsType } from '../validators';

export async function GET(
	req: AuthenticatedMedusaRequest<BlogPerformanceQueryParamsType>,
	res: MedusaResponse,
): Promise<void> {
	try {
		const { start_date, end_date } =
			req.validatedQuery as BlogPerformanceQueryParamsType;

		const { result } = await getBlogExportWorkflow(req.scope).run({
			input: { start_date, end_date },
		});

		const { csvContent, filename } = result;

		res.setHeader('Content-Type', 'text/csv');
		res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
		res.status(200).send(csvContent);
	} catch (error) {
		console.error('Export error:', error);
		res.status(500).json({ message: 'Export failed' });
	}
}

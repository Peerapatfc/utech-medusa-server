import type {
	AuthenticatedMedusaRequest,
	MedusaResponse,
} from '@medusajs/framework/http';
import { getBlogPreviewWorkflow } from '../../../../workflows/blog/preview';
import type { BlogPerformanceQueryParamsType } from '../validators';

export async function GET(
	req: AuthenticatedMedusaRequest<BlogPerformanceQueryParamsType>,
	res: MedusaResponse,
): Promise<void> {
	try {
		const { start_date, end_date } =
			req.validatedQuery as BlogPerformanceQueryParamsType;

		const { result } = await getBlogPreviewWorkflow(req.scope).run({
			input: { start_date, end_date },
		});

		res.status(200).json(result);
	} catch (error) {
		console.error('Preview error:', error);
		res.status(500).json({ message: 'Preview failed' });
	}
}

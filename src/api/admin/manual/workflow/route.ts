import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import myWorkflow from '../../../../workflows/my-workflow';

export async function POST(req: MedusaRequest, res: MedusaResponse) {
	const { result } = await myWorkflow(req.scope).run({
		input: {
			id: '1',
			name: 'test',
		},
	});

	res.status(200).json({
		status: 'ok',
		result,
	});
}

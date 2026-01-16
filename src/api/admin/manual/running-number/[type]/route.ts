import generateRunningNoWorkflow from '../../../../../workflows/order/generate-running-no';
import type { RunningNumberConfigType } from '../../../../../types/running-number-config';
import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';

export async function POST(req: MedusaRequest, res: MedusaResponse) {
	const type = req.params.type as RunningNumberConfigType;
	const { result } = await generateRunningNoWorkflow(req.scope).run({
		input: {
			type,
		},
	});

	res.json(result);
}

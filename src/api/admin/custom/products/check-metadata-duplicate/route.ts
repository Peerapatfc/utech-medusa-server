import type {
	AuthenticatedMedusaRequest,
	MedusaResponse,
} from '@medusajs/framework/http';
import checkMetadataDuplicateWorkflow, {
	type CheckMetadataDuplicateWorkflowInput,
} from '../../../../../workflows/product/check-metadata-duplicate';

interface MetadataDuplicateRequest {
	metadata_key: string;
	metadata_value: string;
	current_product_id: string;
}

export async function GET(
	req: AuthenticatedMedusaRequest,
	res: MedusaResponse,
): Promise<void> {
	try {
		const { metadata_key, metadata_value, current_product_id } =
			req.query as unknown as MetadataDuplicateRequest;

		if (!metadata_key || !metadata_value || !current_product_id) {
			res.status(400).json({
				error: 'Missing required parameters',
			});
			return;
		}

		const { result } = await checkMetadataDuplicateWorkflow(req.scope).run({
			input: {
				metadata_key,
				metadata_value,
				current_product_id,
			} as CheckMetadataDuplicateWorkflowInput,
		});

		res.status(200).json(result);
	} catch (error) {
		res.status(500).json({
			error: 'Internal server error while checking metadata duplicate',
		});
	}
}

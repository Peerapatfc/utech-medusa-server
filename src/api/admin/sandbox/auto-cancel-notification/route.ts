import type {
	AuthenticatedMedusaRequest,
	MedusaResponse,
} from '@medusajs/framework/http';
import restockNotificationOrderWorkflow from '../../../../workflows/notifications/restock-notification/order-workflow';

export async function POST(
	req: AuthenticatedMedusaRequest<{ orderId: string }>,
	res: MedusaResponse,
) {
	const { orderId } = req.body;

	try {
		const { result } = await restockNotificationOrderWorkflow(req.scope).run({
			input: {
				orderId,
			},
		});

		return res.json({
			success: true,
			result,
		});
	} catch (error) {
		console.error('Error executing workflow:', error);
		return res.status(500).json({
			success: false,
			message: 'Failed to process notification workflow',
			error: error.message,
		});
	}
}

import type {
	AuthenticatedMedusaRequest,
	MedusaResponse,
} from '@medusajs/framework/http';
import type { Logger } from '@medusajs/framework/types';
import { fetchUnreadCounts } from '../helpers';

/**
 * GET endpoint to retrieve only unread notification counts
 */
export const GET = async (
	req: AuthenticatedMedusaRequest,
	res: MedusaResponse,
) => {
	const logger: Logger = req.scope.resolve('logger');

	try {
		const customerId = req.auth_context?.actor_id;

		const unreadCounts = await fetchUnreadCounts(req.scope, customerId);

		res.status(200).json({
			unread_count: unreadCounts,
		});
	} catch (error) {
		logger.error('Error retrieving unread counts:', error);
		res.status(500).json({
			message: 'An error occurred while retrieving unread counts',
			error: error instanceof Error ? error.message : 'Unknown error',
		});
	}
};

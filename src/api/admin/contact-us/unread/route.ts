import type {
	AuthenticatedMedusaRequest,
	MedusaResponse,
} from '@medusajs/framework/http';
import { CONTACT_US_MODULE } from '../../../../modules/contact-us';
import type ContactUsModuleService from '../../../../modules/contact-us/service';

export const GET = async (
	req: AuthenticatedMedusaRequest,
	res: MedusaResponse,
) => {
	const actor_id = req.auth_context.actor_id;
	const contactUsModuleService: ContactUsModuleService =
		req.scope.resolve(CONTACT_US_MODULE);

	const [unreadItems, allItems] = await Promise.all([
		contactUsModuleService.listContactUsModels({
			admin_read_status: {
				$ne: [actor_id],
			},
		}),
		contactUsModuleService.listContactUsModels({}),
	]);

	res.status(200).json({
		unread: unreadItems.length,
		total: allItems.length,
	});
};

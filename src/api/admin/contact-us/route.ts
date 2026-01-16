import type {
	AuthenticatedMedusaRequest,
	MedusaResponse,
} from '@medusajs/framework/http';
import type ContactUsModuleService from '../../../modules/contact-us/service';
import { CONTACT_US_MODULE } from '../../../modules/contact-us';

export const GET = async (
	req: AuthenticatedMedusaRequest,
	res: MedusaResponse,
) => {
	try {
		const actor_id = req.auth_context.actor_id;
		const contactUsModuleService: ContactUsModuleService =
			req.scope.resolve(CONTACT_US_MODULE);

		const limit = Number.parseInt(req.query.limit as string) || 20;
		const offset = Number.parseInt(req.query.offset as string) || 0;
		const email = req.query.email as string | undefined;
		const date = req.query.date as string | undefined;
		const status = req.query.status as string | undefined;

		const filters: Record<string, unknown> = {};

		if (email) {
			filters.email = {
				$like: `%${email}%`,
			};
		}

		if (date) {
			const startDate = new Date(date);
			startDate.setHours(0, 0, 0, 0);
			const endDate = new Date(date);
			endDate.setHours(23, 59, 59, 999);

			filters.created_at = {
				$gte: startDate,
				$lte: endDate,
			};
		}

		if (status === 'read') {
			filters.admin_read_status = { $eq: [actor_id] };
		} else if (status === 'unread') {
			filters.admin_read_status = { $ne: [actor_id] };
		}

		const [contactUs, count] =
			await contactUsModuleService.listAndCountContactUsModels(filters, {
				order: { created_at: 'DESC' },
				take: limit,
				skip: offset,
			});

		for (const _contactUs of contactUs) {
			const isRead = _contactUs.admin_read_status.includes(actor_id);
			//@ts-ignore
			// biome-ignore lint/complexity/useLiteralKeys: <explanation>
			_contactUs['is_read'] = isRead;
		}

		res.status(200).json({
			data: contactUs,
			count: count,
			limit: limit,
			offset: offset,
		});
	} catch (error) {
		res
			.status(400)
			.json({ message: `Error getting contact us list : ${error}` });
	}
};

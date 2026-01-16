import type {
	AuthenticatedMedusaRequest,
	MedusaResponse,
} from '@medusajs/framework';
import { CONTACT_US_MODULE } from '../../../../../modules/contact-us';
import type ContactUsModuleService from '../../../../../modules/contact-us/service';

export const PATCH = async (
	req: AuthenticatedMedusaRequest,
	res: MedusaResponse,
) => {
	const id = req.params.id;
	const actor_id = req.auth_context.actor_id;
	const contactUsModuleService: ContactUsModuleService =
		req.scope.resolve(CONTACT_US_MODULE);

	const contactUs = await contactUsModuleService.retrieveContactUsModel(id);
	if (!contactUs) {
		return res.status(404).json({ message: 'Contact Us not found' });
	}

	const readAdmin = contactUs.admin_read_status;
	if (readAdmin.includes(actor_id)) {
		return res.status(200).json(contactUs);
	}

	readAdmin.push(actor_id);
	const updated = await contactUsModuleService.updateContactUsModels({
		id: id,
		admin_read_status: readAdmin,
	});

	res.status(200).json(updated);
};

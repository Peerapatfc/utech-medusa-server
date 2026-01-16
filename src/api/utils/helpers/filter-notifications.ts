import {
	AuthenticatedMedusaRequest,
	MedusaNextFunction,
	MedusaResponse,
} from '@medusajs/framework';

export const filterNotification = (
	req: AuthenticatedMedusaRequest,
	_res: MedusaResponse,
	next: MedusaNextFunction,
) => {
	req.filterableFields = {
		...req.filterableFields,
		channel: ['feed'],
	};

	next();
};

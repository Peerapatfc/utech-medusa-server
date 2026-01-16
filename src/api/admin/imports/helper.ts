import type {
	MedusaNextFunction,
	MedusaRequest,
	MedusaResponse,
} from '@medusajs/framework/http';

export const transformQueryToPagitation = async (
	req: MedusaRequest,
	_res: MedusaResponse,
	next: MedusaNextFunction,
) => {
	const queryFields = req.query;
	const limit = queryFields.limit
		? Number.parseInt(queryFields.limit as string)
		: 20;
	const offset = queryFields.offset
		? Number.parseInt(queryFields.offset as string)
		: 0;

	const order: Record<string, string> = {
		created_at: 'DESC',
	};

	if (!req.queryConfig) {
		req.queryConfig = {
			fields: [],
			pagination: {
				order,
				take: limit,
				skip: offset,
			},
		};
	}

	if (queryFields.order === '-created_at') {
		req.queryConfig.pagination.order = {
			created_at: 'DESC',
		};
	}

	if (queryFields.order === 'created_at') {
		req.queryConfig.pagination.order = {
			created_at: 'ASC',
		};
	}

	next();
};

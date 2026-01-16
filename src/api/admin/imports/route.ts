import type {
	AuthenticatedMedusaRequest,
	MedusaRequest,
	MedusaResponse,
} from '@medusajs/framework';
import type { IUserModuleService, UserDTO } from '@medusajs/framework/types';
import { Modules } from '@medusajs/framework/utils';
import { IMPORT_SERVICE } from '../../../modules/import';
import type ImportService from '../../../modules/import/service';
import importWorkflow from '../../../workflows/imports';
import type { AdminImportType } from './validators';

export const POST = async (
	req: AuthenticatedMedusaRequest<AdminImportType>,
	res: MedusaResponse,
) => {
	try {
		const { result } = await importWorkflow(req.scope).run({
			input: {
				id: req.validatedBody.id,
				url: req.validatedBody.url,
				import_type: req.validatedBody.import_type,
				original_filename: req.validatedBody.original_filename,
				description: req.validatedBody.description,
				imported_by: req.auth_context.actor_id,
			},
		});

		res.status(200).json({
			success: true,
			data: result,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			error: error.message,
		});
	}
};

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
	const importService: ImportService = req.scope.resolve(IMPORT_SERVICE);
	const [import_histories, count] =
		await importService.listAndCountImportHistories(
			{},
			{
				...req.queryConfig.pagination,
			},
		);

	const userService: IUserModuleService = req.scope.resolve(Modules.USER);
	for await (const importHistory of import_histories) {
		//@ts-ignore
		importHistory.imported_by_name = '';

		const user = await userService
			.retrieveUser(importHistory.imported_by)
			.catch(() => null)
			.then((user) => user as UserDTO);

		if (!user) {
			continue;
		}

		if (user.first_name && user.last_name) {
			//@ts-ignore
			importHistory.imported_by_name = `${user.first_name || ''} ${user.last_name || ''}`;
		} else {
			//@ts-ignore
			importHistory.imported_by_name = user.email || '';
		}
	}

	res.status(200).json({
		import_histories,
		limit: 20,
		offset: 0,
		count,
	});
};

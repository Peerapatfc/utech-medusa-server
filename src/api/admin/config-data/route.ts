import type {
	AuthContext,
	MedusaRequest,
	MedusaResponse,
} from '@medusajs/framework/http';
import { STOREFRONT_MODULE } from 'src/modules/storefront';
import type StorefrontModuleService from 'src/modules/storefront/service';
import { CONFIG_DATA_MODULE } from '../../../modules/config-data';
import type ConfigDataModuleService from '../../../modules/config-data/service';

interface CustomMedusaRequest extends MedusaRequest {
	auth_context: AuthContext;
}

export const POST = async (req: CustomMedusaRequest, res: MedusaResponse) => {
	try {
		const { actor_id } = req.auth_context;
		if (!actor_id) {
			return res.status(401).json({ message: 'Unauthorized' });
		}

		const body = req.body;
		const configDataModuleService: ConfigDataModuleService =
			req.scope.resolve(CONFIG_DATA_MODULE);
		const resp = await configDataModuleService.saveRunningNumberConfig(
			body,
			actor_id,
		);

		const storefrontService: StorefrontModuleService =
			req.scope.resolve(STOREFRONT_MODULE);
		storefrontService.revalidateTags(['bad-words']);

		res.json({
			resp,
		});
	} catch (err) {
		res.status(500).json({
			message: err.message,
		});
	}
};

export const GET = async (req: CustomMedusaRequest, res: MedusaResponse) => {
	try {
		const configDataModuleService: ConfigDataModuleService =
			req.scope.resolve(CONFIG_DATA_MODULE);
		const paths = req.query.paths as string[];

		const data = await configDataModuleService.getByPaths(paths);

		res.json({
			data,
		});
	} catch (err) {
		res.status(500).json({
			message: err.message,
		});
	}
};

export const DELETE = async (req: CustomMedusaRequest, res: MedusaResponse) => {
	const { actor_id } = req.auth_context;
	if (!actor_id) {
		return res.status(401).json({ message: 'Unauthorized' });
	}

	const path = req.query.path as string;
	const configDataModuleService: ConfigDataModuleService =
		req.scope.resolve(CONFIG_DATA_MODULE);
	const result = await configDataModuleService.deleteByPath(path);

	const storefrontService: StorefrontModuleService =
		req.scope.resolve(STOREFRONT_MODULE);
	storefrontService.revalidateTags(['bad-words']);

	res.status(200).json({
		data: result,
	});
};

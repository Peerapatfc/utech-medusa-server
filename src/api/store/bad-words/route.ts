import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { CONFIG_DATA_MODULE } from '../../../modules/config-data';
import type ConfigDataModuleService from '../../../modules/config-data/service';

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
	try {
		const configDataModuleService: ConfigDataModuleService =
			req.scope.resolve(CONFIG_DATA_MODULE);

		const paths = ['review/general/prohibited_word'];

		const configData = await configDataModuleService.getByPaths(paths);

		let badWords: string[] = [];

		if (configData.length > 0) {
			badWords = configData[0]?.value
				.split(',')
				.map((word) => word.trim())
				.filter((word) => word.length > 0);
		}

		res.json({ badWords });
	} catch (err) {
		res.status(500).json({
			message: err.message,
		});
	}
};

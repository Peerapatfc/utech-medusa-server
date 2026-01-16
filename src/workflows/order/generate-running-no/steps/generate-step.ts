import { createStep, StepResponse } from '@medusajs/framework/workflows-sdk';
import type {
	RunningNumberConfigMap,
	RunningNumberConfigTemplate,
	RunningNumberConfigType,
} from '../../../../types/running-number-config';
import { CONFIG_DATA_MODULE } from '../../../../modules/config-data';
import type ConfigDataModuleService from '../../../../modules/config-data/service';
import type { Logger } from '@medusajs/framework/types';
import { getCurrentDate } from '../../../../utils/date';

const getIncrementNo = (
	configMap: RunningNumberConfigMap,
	isCurrentPrefix: boolean,
) => {
	const {
		current_no = 0,
		counter_increment = 1,
		counter_padding = 10,
	} = configMap;

	if (!isCurrentPrefix) {
		return counter_increment.toString().padStart(counter_padding, '0');
	}

	const incrementNo = current_no + counter_increment;
	return incrementNo.toString().padStart(counter_padding, '0');
};

const generateStep = createStep(
	'generate-step',
	async (
		input: {
			configMap: RunningNumberConfigMap;
			configTemplate: RunningNumberConfigTemplate;
			type: RunningNumberConfigType;
		},
		context,
	) => {
		const logger: Logger = context.container.resolve('logger');
		logger.info('Running generate-step');

		if (!input.configMap.is_enable) {
			return new StepResponse({
				generatedNo: Date.now().toString(),
			});
		}

		const configDataService: ConfigDataModuleService =
			context.container.resolve(CONFIG_DATA_MODULE);

		const { configMap, configTemplate, type } = input;
		const formats = configMap.format.split(/}{|{|}/g);
		let current_prefix = configMap.current_prefix;

		let result = '';
		for await (const format of formats) {
			if (!format) continue;

			switch (format.toLowerCase()) {
				case 'yy':
					result += getCurrentDate('YY');
					break;
				case 'yyyy':
					result += getCurrentDate('YYYY');
					break;
				case 'mm':
					result += getCurrentDate('MM');
					break;
				case 'm':
					result += getCurrentDate('M');
					break;
				case 'dd':
					result += getCurrentDate('DD');
					break;
				case 'd':
					result += getCurrentDate('D');
					break;
				case 'counter': {
					const isCurrentPrefix = current_prefix === result;
					if (!isCurrentPrefix) {
						current_prefix = result;
					}

					const incrementNo = getIncrementNo(configMap, isCurrentPrefix);
					result += incrementNo;

					const updateData = {
						[input.type]: {
							current_no: {
								path: configTemplate.current_no.path,
								value: String(incrementNo),
							},
							current_prefix: {
								path: configTemplate.current_prefix.path,
								value: current_prefix,
							},
						},
					};

					await configDataService.saveRunningNumberConfig(updateData, '');
					break;
				}
				default:
					result += format;
					break;
			}
		}

		return new StepResponse({
			generatedNo: result,
		});
	},
);

export default generateStep;

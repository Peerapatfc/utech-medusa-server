import {
	initialConfigTemplate,
	type RunningNumberConfigTemplate,
	RunningNumberConfigType,
} from '../types/running-number-config';
import { ConfigDataPath } from '../types/config-data';

export const getInitialConfigTemplateByType = (
	type: RunningNumberConfigType,
): RunningNumberConfigTemplate => {
	switch (type) {
		case RunningNumberConfigType.ORDER_NO:
			return { ...initialConfigTemplate };

		case RunningNumberConfigType.INVOICE_NO:
			return {
				is_enable: {
					path: ConfigDataPath.RUNNING_NUMBER_INVOICE_ISENABLE,
					value: '0',
				},
				format: {
					path: ConfigDataPath.RUNNING_NUMBER_INVOICE_FORMAT,
					value: '{yy}{mm}{dd}{counter}',
				},
				counter_increment: {
					path: ConfigDataPath.RUNNING_NUMBER_INVOICE_COUNTER_INCREMENT,
					value: '1',
				},
				counter_padding: {
					path: ConfigDataPath.RUNNING_NUMBER_INVOICE_COUNTER_PADDING,
					value: '4',
				},
				current_no: {
					path: ConfigDataPath.RUNNING_NUMBER_INVOICE_CURRENT_NO,
					value: '0',
				},
				current_prefix: {
					path: ConfigDataPath.RUNNING_NUMBER_INVOICE_CURRENT_PREFIX,
					value: '',
				},
			};

		case RunningNumberConfigType.CREDIT_NOTE_NO:
			return {
				is_enable: {
					path: ConfigDataPath.RUNNING_NUMBER_CREDIT_NOTE_ISENABLE,
					value: '0',
				},
				format: {
					path: ConfigDataPath.RUNNING_NUMBER_CREDIT_NOTE_FORMAT,
					value: '{yy}{mm}{dd}{counter}',
				},
				counter_increment: {
					path: ConfigDataPath.RUNNING_NUMBER_CREDIT_NOTE_COUNTER_INCREMENT,
					value: '1',
				},
				counter_padding: {
					path: ConfigDataPath.RUNNING_NUMBER_CREDIT_NOTE_COUNTER_PADDING,
					value: '4',
				},
				current_no: {
					path: ConfigDataPath.RUNNING_NUMBER_CREDIT_NOTE_CURRENT_NO,
					value: '0',
				},
				current_prefix: {
					path: ConfigDataPath.RUNNING_NUMBER_CREDIT_NOTE_CURRENT_PREFIX,
					value: '',
				},
			};

		case RunningNumberConfigType.SHIPPING_NO:
			return {
				is_enable: {
					path: ConfigDataPath.RUNNING_NUMBER_SHIPPING_ISENABLE,
					value: '0',
				},
				format: {
					path: ConfigDataPath.RUNNING_NUMBER_SHIPPING_FORMAT,
					value: '{yy}{mm}{dd}{counter}',
				},
				counter_increment: {
					path: ConfigDataPath.RUNNING_NUMBER_SHIPPING_COUNTER_INCREMENT,
					value: '1',
				},
				counter_padding: {
					path: ConfigDataPath.RUNNING_NUMBER_SHIPPING_COUNTER_PADDING,
					value: '4',
				},
				current_no: {
					path: ConfigDataPath.RUNNING_NUMBER_SHIPPING_CURRENT_NO,
					value: '0',
				},
				current_prefix: {
					path: ConfigDataPath.RUNNING_NUMBER_SHIPPING_CURRENT_PREFIX,
					value: '',
				},
			};

		default:
			return { ...initialConfigTemplate };
	}
};

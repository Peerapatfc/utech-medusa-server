import { getInitialConfigTemplateByType } from '../generate-running-no';
import {
	RunningNumberConfigType,
	initialConfigTemplate,
} from '../../types/running-number-config';
import { ConfigDataPath } from '../../types/config-data';

describe('getInitialConfigTemplateByType', () => {
	it('should return the default template for ORDER_NO', () => {
		const result = getInitialConfigTemplateByType(
			RunningNumberConfigType.ORDER_NO,
		);
		expect(result).toEqual(initialConfigTemplate);
	});

	it('should return the correct template for INVOICE_NO', () => {
		const result = getInitialConfigTemplateByType(
			RunningNumberConfigType.INVOICE_NO,
		);
		expect(result).toEqual({
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
		});
	});

	it('should return the correct template for CREDIT_NOTE_NO', () => {
		const result = getInitialConfigTemplateByType(
			RunningNumberConfigType.CREDIT_NOTE_NO,
		);
		expect(result).toEqual({
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
		});
	});

	it('should return the correct template for SHIPPING_NO', () => {
		const result = getInitialConfigTemplateByType(
			RunningNumberConfigType.SHIPPING_NO,
		);
		expect(result).toEqual({
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
		});
	});
});

import type React from 'react';
import {
	type Control,
	Controller,
	type FieldValues,
	type UseFormSetValue,
} from 'react-hook-form';
import { InformationCircle } from '@medusajs/icons';
import { Select, Tooltip, Input } from '@medusajs/ui';
import { useEffect } from 'react';
import { findConfigDataByPath } from '../../../utils/config-data';
import type { ConfigData } from '@customTypes/config-data';

const items = [
	{ value: '0', label: 'No' },
	{ value: '1', label: 'Yes' },
];

interface RunningNumberFormProps {
	type: 'order' | 'invoice' | 'credit_note';
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	control: Control<FieldValues, any>;
	setValue: UseFormSetValue<FieldValues>;
	data: ConfigData[];
}

const RunningNumberForm: React.FC<RunningNumberFormProps> = ({
	type,
	control,
	setValue,
	data,
}) => {
	useEffect(() => {
		setValue(
			`${type}_is_enable`,
			findConfigDataByPath(data, `running_number/${type}/is_enable`) || '0',
		);
		setValue(
			`${type}_format`,
			findConfigDataByPath(data, `running_number/${type}/format`) ||
				'{yy}{mm}{dd}{counter}',
		);
		setValue(
			`${type}_counter_increment`,
			findConfigDataByPath(data, `running_number/${type}/counter_increment`) ||
				'1',
		);
		setValue(
			`${type}_counter_padding`,
			findConfigDataByPath(data, `running_number/${type}/counter_padding`) ||
				'4',
		);
	}, [setValue, data, type]);

	let type_code = 'ORD';
	if (type === 'invoice') {
		type_code = 'INV';
	} else if (type === 'credit_note') {
		type_code = 'CDM';
	}
	return (
		<div className='flex flex-col gap-y-6 ml-8 w-1/2'>
			{/* Enable */}
			<div>
				<div className='flex items-center mb-2'>
					<span className='font-semibold text-sm'>{'Enabled'}</span>
					<span className='text-rose-500 mr-2'>*</span>
					<Tooltip content='[all store]'>
						<InformationCircle />
					</Tooltip>
				</div>
				<Controller
					name={`${type}_is_enable`}
					control={control}
					render={({ field }) => (
						<Select
							{...field}
							onValueChange={(value) => field.onChange(value)}
							value={field.value}
						>
							<Select.Trigger>
								<Select.Value placeholder={'Enabled'} />
							</Select.Trigger>
							<Select.Content>
								{items.map((item) => (
									<Select.Item key={item.value} value={item.value}>
										{item.label}
									</Select.Item>
								))}
							</Select.Content>
						</Select>
					)}
				/>
			</div>

			{/* Number Format */}
			<div>
				<div className='flex items-center mb-2'>
					<span className='font-semibold text-sm'>{'Number Format'}</span>
					<span className='text-rose-500 mr-2'>*</span>
					<Tooltip content='[all store]'>
						<InformationCircle />
					</Tooltip>
				</div>
				<Controller
					name={`${type}_format`}
					control={control}
					render={({ field }) => (
						<Input
							{...field}
							placeholder={`${
								type === 'order' ? 'UT-D' : 'INV'
							}-{yy}{mm}{dd}{counter}`}
							className='mb-2'
							required={true}
						/>
					)}
				/>
				<p className='text-xs text-gray-500'>
					You can use variables {'{yyyy}, {yy}, {m}, {mm}, {d}, {dd}.'} If you
					type {type_code}-{'{yy}-{mm}-{dd}-{counter}'} in the field, you will
					have {type.replace('_', ' ')} numbers of the kind: {type_code}
					-13-08-15-000077
				</p>
			</div>

			{/* Counter Increment Step */}
			<div>
				<div className='flex items-center mb-2'>
					<span className='font-semibold text-sm'>
						{'Counter Increment Step'}
					</span>
					<span className='text-rose-500 mr-2'>*</span>
					<Tooltip content='[all store]'>
						<InformationCircle />
					</Tooltip>
				</div>
				<Controller
					name={`${type}_counter_increment`}
					control={control}
					render={({ field }) => (
						<Input
							{...field}
							className='mb-2'
							type='number'
							value={field.value}
							onChange={(e) => field.onChange(e.target.value)}
							required={true}
						/>
					)}
				/>
				<p className='text-xs text-gray-500'>
					E.g. the last number is 0009. If increment step is 2, the next number
					will be 00011
				</p>
			</div>

			{/* Counter Padding */}
			<div>
				<div className='flex items-center mb-2'>
					<span className='font-semibold text-sm'>{'Counter Padding'}</span>
					<span className='text-rose-500 mr-2'>*</span>
					<Tooltip content='[all store]'>
						<InformationCircle />
					</Tooltip>
				</div>
				<Controller
					name={`${type}_counter_padding`}
					control={control}
					render={({ field }) => (
						<Input
							{...field}
							className='mb-2'
							type='number'
							value={field.value}
							onChange={(e) => field.onChange(e.target.value)}
							required={true}
						/>
					)}
				/>
				<p className='text-xs text-gray-500'>
					Total number of digits in the {type.replace('_', ' ')} number. If the{' '}
					{type.replace('_', ' ')} id is 24 and padding is 5, the result will be
					00024. Set to 0 (zero) not to add leading zeros.
				</p>
			</div>
		</div>
	);
};

export default RunningNumberForm;

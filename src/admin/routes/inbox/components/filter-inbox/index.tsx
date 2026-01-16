import { useState, useCallback, useEffect } from 'react';
import { ChevronDown } from '@medusajs/icons';
import { clx, DatePicker, Input, Select, Button } from '@medusajs/ui';
import FilterField from './filter-field';
import type { ContactUsFilters } from '../../../../../types/contact-us';

const statusOptions = [
	{ value: 'read', label: 'Read' },
	{ value: 'unread', label: 'Unread' },
];

type filterInboxProps = {
	filters: ContactUsFilters;
	onSubmit: (values: ContactUsFilters) => void;
	onReset: () => void;
};

const FilterInbox = ({ filters, onSubmit, onReset }: filterInboxProps) => {
	const [isOpen, setIsOpen] = useState(false);

	const [formValues, setFormValues] = useState(filters);

	const handleClick = useCallback(() => {
		setIsOpen((prev) => !prev);
	}, []);

	const handleSubmit = () => {
		onSubmit(formValues);
	};

	const handleReset = () => {
		setFormValues({ email: '', date: '', status: '' });
		onReset();
	};

	useEffect(() => {
		setFormValues(filters);
	}, [filters]);

	return (
		<div className=''>
			<button
				onClick={handleClick}
				type='button'
				className='flex items-center justify-between w-full px-6 py-4 hover:bg-gray-200 dark:hover:bg-black'
				aria-label='Toggle filter options'
				aria-expanded={isOpen}
			>
				<p className='text-[20px] font-[500]'>Filter</p>

				<ChevronDown
					className={clx(
						'transition-transform duration-300',
						isOpen ? 'rotate-180' : 'rotate-0',
					)}
				/>
			</button>

			<div
				className={clx(
					'overflow-hidden transition-all duration-300 ease-in-out',
					isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0',
				)}
			>
				<div className='flex flex-col gap-y-5 pb-6'>
					<div className='flex gap-x-5 justify-between mt-4 p-6 mx-auto'>
						{/* date */}
						<FilterField label='Received Date'>
							<DatePicker
								aria-label='Select received date'
								value={formValues.date ? new Date(formValues.date) : null}
								onChange={(date) =>
									setFormValues((prev) => ({
										...prev,
										date: date
											? new Date(date).toLocaleDateString('en-CA')
											: '',
									}))
								}
							/>
						</FilterField>
						{/* date */}

						{/* email */}

						<FilterField label='Email'>
							<Input
								placeholder='Search Email'
								id='email'
								type='search'
								aria-label='Search by email'
								value={formValues.email}
								onChange={(e) =>
									setFormValues((prev) => ({
										...prev,
										email: e.target.value,
									}))
								}
							/>
						</FilterField>
						{/* email */}

						{/* status */}
						<FilterField label='Status'>
							<Select
								value={formValues.status}
								onValueChange={(value) =>
									setFormValues((prev) => ({
										...prev,
										status: value as '' | 'read' | 'unread',
									}))
								}
							>
								<Select.Trigger aria-label='Select a status'>
									<Select.Value placeholder='Select status' />
								</Select.Trigger>
								<Select.Content>
									{statusOptions.map((item) => (
										<Select.Item
											className='hover:bg-gray-200 dark:hover:bg-gray-900'
											key={item.value}
											value={item.value}
											aria-label={`Filter by status: ${item.label}`}
										>
											{item.label}
										</Select.Item>
									))}
								</Select.Content>
							</Select>
						</FilterField>
						{/* status */}
					</div>
					<div className='mx-auto flex gap-x-9'>
						<Button
							className='w-[100px] h-[35px] font-[500] text-[14px]'
							type='submit'
							variant='primary'
							onClick={handleReset}
						>
							Reset
						</Button>

						<Button
							className='w-[100px] h-[35px] bg-[#FF6B00] hover:bg-[#FFB766] text-white font-[500] text-[14px]'
							type='submit'
							variant='transparent'
							onClick={handleSubmit}
						>
							Submit
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default FilterInbox;

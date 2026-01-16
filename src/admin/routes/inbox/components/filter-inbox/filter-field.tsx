import type React from 'react';
import { Label } from '@medusajs/ui';

type FilterFieldProps = {
	label: string;
	children: React.ReactNode;
};

const FilterField = ({ label, children }: FilterFieldProps) => {
	return (
		<div className='w-[250px] flex flex-col gap-1 text-center'>
			<Label className='text-[12px] font-[500]'>{label}</Label>
			{children}
		</div>
	);
};

export default FilterField;

import { Link } from 'react-router-dom';

type Param = {
	id?: string;
};

export const AddSerialNumber = ({ id }: Param) => {
	return (
		<div className='flex items-center justify-end px-6 py-4'>
			<Link
				to={`/orders/${id}/serial-number`}
				className='text-sm text-gray-500'
			>
				Add serial number
			</Link>
		</div>
	);
};

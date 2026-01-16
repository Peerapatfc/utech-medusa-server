import { Badge, Button, clx } from '@medusajs/ui';
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import type { CountStatus } from '../../../../common/constants';

export const BroadCastsTableStatusFilter = ({
	countStatus,
}: {
	countStatus: CountStatus[];
}) => {
	const [_] = useSearchParams();
	const [status, setStatus] = useState<string>('');
	const [params, setParams] = useState<string>('');

	useEffect(() => {
		const status = _.get('status') || '';
		setStatus(status);
		_.delete('status');
		setParams(_.toString());
	}, [_]);

	return (
		<div className='flex items-center justify-start gap-x-2 mt-2'>
			{countStatus.map((option) => {
				let url = option.value !== '' ? `status=${option.value}` : '';
				url +=
					params !== '' ? `${option.value !== '' ? '&' : ''}${params}` : '';
				return (
					<Button
						key={option.value}
						size='small'
						variant='transparent'
						className={clx(
							'rounded-full px-2 py-1 border border-transparent hover:border-inherit',
							{
								'border-inherit': status === option.value,
							},
						)}
						asChild
					>
						<Link to={`/broadcasts?${url}`}>
							{option.label}
							{option.count > 0 && <Badge size='2xsmall'>{option.count}</Badge>}
						</Link>
					</Button>
				);
			})}
		</div>
	);
};

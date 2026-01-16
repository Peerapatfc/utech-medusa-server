import { ChevronRight } from '@medusajs/icons';
import { Container } from '@medusajs/ui';
import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';

type Param = {
	title: string;
	sub_title: string;
	handleUrl: string;
	icon: ReactElement;
	button?: ReactElement;
};

const AdvancedSettingButton = ({
	title,
	sub_title,
	handleUrl,
	icon,
	button,
}: Param) => {
	return (
		<Link to={handleUrl}>
			<Container className='grid grid-cols-12 gap-4 items-center p-4 min-h-24 '>
				<>
					<div className='col-span-9 flex gap-x-4 items-center'>
						<div>{icon}</div>
						<div>
							<h2 style={{ fontWeight: '700' }}>{title}</h2>
							<p className='text-sm text-gray-500'>{sub_title}</p>
						</div>
					</div>
					<div className='col-span-3 flex justify-end'>
						{button ? button : <ChevronRight />}
					</div>
				</>
			</Container>
		</Link>
	);
};

export default AdvancedSettingButton;

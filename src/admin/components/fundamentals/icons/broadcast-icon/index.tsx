import type React from 'react';
import type IconProps from '../types/icon-type';

const BoardcastIcon: React.FC<IconProps> = ({
	width = '16',
	height = '16',
	color = 'currentColor',
	...attributes
}) => {
	return (
		<div className='relative'>
			{/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
			<svg
				{...attributes}
				xmlns='http://www.w3.org/2000/svg'
				width={width}
				height={height}
				viewBox={`0 0 ${width} ${height}`}
				fill='none'
				className='absolute left-[-1px]'
			>
				<path
					d='M7.06436 7.88388C6.5762 7.39573 6.5762 6.60427 7.06436 6.11612C7.55251 5.62796 8.34397 5.62796 8.83213 6.11612C9.32028 6.60427 9.32028 7.39573 8.83213 7.88388M5.29659 9.65165C3.83213 8.18718 3.83213 5.81282 5.29659 4.34835C6.76106 2.88388 9.13543 2.88388 10.5999 4.34835C12.0644 5.81282 12.0644 8.18718 10.5999 9.65165M3.52882 11.4194C1.08805 8.97864 1.08805 5.02136 3.52882 2.58058C5.9696 0.139806 9.92688 0.139806 12.3677 2.58058C14.8084 5.02136 14.8084 8.97864 12.3677 11.4194'
					stroke='#A1A1AA'
					strokeWidth='1.5'
					strokeLinecap='round'
					strokeLinejoin='round'
				/>
			</svg>
		</div>
	);
};

export default BoardcastIcon;

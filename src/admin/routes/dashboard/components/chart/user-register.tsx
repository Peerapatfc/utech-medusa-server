import {
	ArcElement,
	BarElement,
	CategoryScale,
	Chart as ChartJS,
	Legend as ChartLegend,
	Tooltip as ChartTooltip,
	LinearScale,
	Title,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

import type { UserRegistrationTrend } from '@customTypes/dashboard';
import { Container, Heading } from '@medusajs/ui';
import { getBuddhistDate } from '../../../../../utils/date';
import { useLine } from '../../../../hooks/chart/use-line-chart';

// Register ChartJS components
ChartJS.register(
	CategoryScale,
	LinearScale,
	BarElement,
	ArcElement,
	Title,
	ChartTooltip,
	ChartLegend,
);

interface Props {
	userRegisterTrend: UserRegistrationTrend[];
}

export function UserRegisterChart({ userRegisterTrend }: Props) {
	const labels = userRegisterTrend.map((item) => getBuddhistDate(item.date));
	const data = userRegisterTrend.map((item) => item.count);

	// Prepare data for bar chart
	const lineData = {
		labels,
		datasets: [
			{
				label: 'Count',
				data,
				backgroundColor: 'rgba(255, 206, 86, 0.7)',
				borderColor: 'rgba(255, 206, 86, 1)',
				borderWidth: 2,
				borderRadius: 4,
			},
		],
	};

	const { lineOptions } = useLine({ xTitle: 'date', yTitle: 'number' });

	return (
		<Container>
			<div className='flex justify-between items-center mb-4'>
				<Heading className='text-lg font-medium'>Registered Users</Heading>
			</div>
			<div className='h-[300px]'>
				<Line options={lineOptions} data={lineData} />
			</div>
		</Container>
	);
}

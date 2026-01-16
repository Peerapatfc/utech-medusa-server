import {
	CategoryScale,
	Chart as ChartJS,
	Legend,
	LineElement,
	LinearScale,
	PointElement,
	Title,
	Tooltip,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

import type { DashboardDataInsight } from '@customTypes/dashboard';
import { Container, Heading } from '@medusajs/ui';
import { getBuddhistDate } from '../../../../../utils/date';
import { useLine } from '../../../../hooks/chart/use-line-chart';

ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend,
);

interface Props {
	dashboard?: DashboardDataInsight;
}

const PaidUsers = ({ dashboard }: Props) => {
	const userRecentPurchaser = dashboard?.users.recent_purchasers ?? [];
	const labels = userRecentPurchaser.map((user) => getBuddhistDate(user.date));
	const data = userRecentPurchaser.map((user) => user.count);
	const { lineOptions } = useLine({ xTitle: 'date', yTitle: 'Paid users' });
	const lineData = {
		labels,
		datasets: [
			{
				label: 'user',
				data,
				borderColor: 'rgb(54, 162,235)',
				backgroundColor: 'rgba(54, 162,235, 0.5)',
				borderWidth: 2,
				borderRadius: 4,
			},
		],
	};

	return (
		<Container>
			<div className='flex justify-between items-center mb-4'>
				<Heading className='text-lg font-medium'>Paid users</Heading>
			</div>
			<div className='h-[300px]'>
				<Line options={lineOptions} data={lineData} />
			</div>
		</Container>
	);
};

export default PaidUsers;

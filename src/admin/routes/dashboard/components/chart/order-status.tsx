import type { Orders } from '@customTypes/dashboard';
import { Container, Heading } from '@medusajs/ui';
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
import { useState } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import ChartTypeSelector, { ChartType } from './chart-type-selector';

import { useBarChart } from '../../../../hooks/chart/use-bar-chart';
import { useDoughnutChart } from '../../../../hooks/chart/use-doughnut-chart';

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
	orders: Orders | undefined;
	isLoading?: boolean;
}
export function OrderStatusChart({ orders }: Props) {
	const [chartType, setChartType] = useState<ChartType>(ChartType.BAR);

	const rawData = {
		labels: [...Object.keys(orders?.counts_by_status.counts ?? {})],
		count: [...Object.values(orders?.counts_by_status.counts ?? {})],
	};

	// Prepare data for bar chart
	const barChartData = {
		labels: rawData.labels,
		datasets: [
			{
				label: 'Total Purchased',
				data: rawData.count,
				backgroundColor: 'rgba(54, 162, 235, 0.7)',
				borderColor: 'rgba(54, 162, 235, 1)',
				borderWidth: 1,
				borderRadius: 4,
			},
		],
	};

	// Prepare data for donut chart
	const totalPurchased = rawData.count.reduce((sum, item) => sum + item, 0);

	const { barOptions } = useBarChart({});
	const { donutOptions, donutChartData } = useDoughnutChart({
		total: totalPurchased,
		labels: rawData.labels,
		data: rawData.count,
	});

	return (
		<Container>
			<div className='flex justify-between items-center mb-4'>
				<Heading>Order Status</Heading>
				<ChartTypeSelector chartType={chartType} onChange={setChartType} />
			</div>
			<div className='h-[300px]'>
				{chartType === 'bar' ? (
					<Bar data={barChartData} options={barOptions} />
				) : (
					<Doughnut data={donutChartData} options={donutOptions} />
				)}
			</div>
		</Container>
	);
}

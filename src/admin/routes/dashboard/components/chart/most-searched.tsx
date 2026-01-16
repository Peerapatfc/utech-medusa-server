import type { MostSearched } from '@customTypes/dashboard';
import { Container, Heading } from '@medusajs/ui';
import {
	ArcElement,
	BarElement,
	CategoryScale,
	Chart as ChartJS,
	Legend as ChartLegend,
	type ChartOptions,
	Tooltip as ChartTooltip,
	LinearScale,
	Title,
} from 'chart.js';
import { useState } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import { useBarChart } from '../../../../hooks/chart/use-bar-chart';
import ChartTypeSelector, { ChartType } from './chart-type-selector';
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
	mostSearched: MostSearched[];
}
export function MostSearchedChart({ mostSearched }: Props) {
	const [chartType, setChartType] = useState<ChartType>(ChartType.BAR);

	// Prepare data for bar chart
	const barChartData = {
		labels: mostSearched.map((item) => item.keyword),
		datasets: [
			{
				label: 'Search Count',
				data: mostSearched.map((item) => item.count),
				backgroundColor: 'rgba(54, 162, 235, 0.7)',
				borderColor: 'rgba(54, 162, 235, 1)',
				borderWidth: 1,
				borderRadius: 4,
			},
		],
	};

	// Prepare data for donut chart
	const totalSearches = mostSearched.reduce((sum, item) => sum + item.count, 0);
	const donutChartData = {
		labels: mostSearched.map((item) => item.keyword),
		datasets: [
			{
				data: mostSearched.map((item) => item.count),
				backgroundColor: [
					'rgba(54, 162, 235, 0.7)',
					'rgba(75, 192, 192, 0.7)',
					'rgba(153, 102, 255, 0.7)',
					'rgba(255, 159, 64, 0.7)',
				],
				borderColor: [
					'rgba(54, 162, 235, 1)',
					'rgba(75, 192, 192, 1)',
					'rgba(153, 102, 255, 1)',
					'rgba(255, 159, 64, 1)',
				],
				borderWidth: 1,
			},
		],
	};

	const { barOptions } = useBarChart({
		options: {
			indexAxis: 'y',
			plugins: {
				legend: {
					display: false,
				},
				tooltip: {
					callbacks: {
						label: (context) => {
							const value = context.parsed.x;
							return `value: ${value}`;
						},
					},
				},
			},
		},
	});

	const donutOptions: ChartOptions<'doughnut'> = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: {
				position: 'right' as const,
			},
			tooltip: {
				callbacks: {
					label: (context) => {
						const value = context.raw as number;
						const percentage = Math.round((value / totalSearches) * 100);
						return `Searches: ${value} (${percentage}%)`;
					},
				},
			},
		},
		cutout: '50%',
	};

	return (
		<Container>
			<div className='flex justify-between items-center mb-4'>
				<Heading className='text-lg font-medium'>Most Searched for</Heading>
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

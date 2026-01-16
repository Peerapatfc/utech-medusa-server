import type { CampaignBanner } from '@customTypes/dashboard';
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
import { Bar, Doughnut } from 'react-chartjs-2';
import ChartTypeSelector from './chart-type-selector';

import { truncateText } from '../../../../../utils/truncate-text';
import { useBarChart } from '../../../../hooks/chart/use-bar-chart';
import { useChart } from '../../../../hooks/chart/use-chart';
import { useDoughnutChart } from '../../../../hooks/chart/use-doughnut-chart';

import { Container, Heading } from '@medusajs/ui';

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
	campaignBanner: CampaignBanner[];
	isLoading?: boolean;
}
export function CampaignBannerChart({ campaignBanner }: Props) {
	const originalLabels = campaignBanner.map((item) => item.name);
	const labels = campaignBanner.map((item) => truncateText(item.name, 10));
	// Prepare data for bar chart
	const barChartData = {
		labels: labels,
		datasets: [
			{
				label: 'Campaign',
				data: campaignBanner.map((item) => item.count),
				backgroundColor: 'rgba(54, 162, 235, 0.7)',
				borderColor: 'rgba(54, 162, 235, 1)',
				borderWidth: 1,
				borderRadius: 4,
			},
		],
	};

	// Prepare data for donut chart
	const totalPurchased = campaignBanner.reduce(
		(sum, item) => sum + item.count,
		0,
	);

	const { chartType, setChartType } = useChart();
	const { barOptions } = useBarChart({
		originalLabels,
	});

	const { donutOptions, donutChartData } = useDoughnutChart({
		total: totalPurchased,
		labels: campaignBanner.map((item) => item.name),
		data: campaignBanner.map((item) => item.count),
	});

	return (
		<Container>
			<div className='flex justify-between items-center mb-4'>
				<Heading className='text-lg font-medium'>Campaign</Heading>
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

import type { MostViewed, MostWishlist } from '@customTypes/dashboard';
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
import { useMemo } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import { useBarChart } from '../../../../hooks/chart/use-bar-chart';
import { useChart } from '../../../../hooks/chart/use-chart';
import { useDoughnutChart } from '../../../../hooks/chart/use-doughnut-chart';
import ChartTypeSelector from './chart-type-selector';

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
	mostViewed: MostViewed[];
	mostWishlist: MostWishlist[];
	isLoading?: boolean;
}

const ProductViewsChart = ({ mostViewed, mostWishlist }: Props) => {
	const { chartType, setChartType } = useChart();
	const { barOptions } = useBarChart({
		options: {
			plugins: {
				legend: {
					display: true,
				},
			},
		},
	});

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	const products = useMemo(() => {
		return mostViewed.map((mostViewedItem) => {
			const wishlist = mostWishlist.find(
				(wishlistItem) => wishlistItem.product_id === mostViewedItem.product_id,
			);
			return {
				product_title: mostViewedItem.product_title,
				product_id: mostViewedItem.product_id,
				view: mostViewedItem.count,
				wishlist: wishlist ? wishlist.count : 0,
			};
		});
	}, [mostViewed.length, mostWishlist.length]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	const barChartData = useMemo(
		() => ({
			labels: products.map((item) => item.product_title),
			datasets: [
				{
					label: 'Product Views',
					data: products.map((item) => item.view),
					backgroundColor: 'rgba(54, 162, 235, 0.7)',
					borderColor: 'rgba(54, 162, 235, 1)',
					borderWidth: 1,
					borderRadius: 4,
				},
				{
					label: 'Wishlist',
					data: products.map((item) => item.wishlist),
					backgroundColor: 'rgba(153, 102, 255, 0.7)',
					borderColor: 'rgba(153, 102, 255, 1)',
					borderWidth: 1,
					borderRadius: 4,
				},
			],
		}),
		[products.length],
	);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	const totalViews = useMemo(() => {
		return products.reduce((sum, item) => sum + item.view, 0);
	}, [products.length]);

	const { donutOptions, donutChartData } = useDoughnutChart({
		total: totalViews,
		labels: products.map((item) => item.product_title),
		data: products.map((item) => item.view),
	});

	return (
		<Container>
			<div className='flex justify-between items-center mb-4'>
				<Heading className='text-lg font-medium'>
					Product view & Wishlist
				</Heading>
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
};

export default ProductViewsChart;

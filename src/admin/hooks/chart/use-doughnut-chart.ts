import type { ChartOptions } from 'chart.js';
import { useEffect, useState } from 'react';
import { randomRGBColor } from '../../lib/color';

interface Props {
	total: number;
	labels: string[];
	data: unknown[];
}
export const useDoughnutChart = ({ total, labels, data }: Props) => {
	const [backgroundColor, setBackgroundColor] = useState<string[]>([]);
	const [borderColor, setBorderColor] = useState<string[]>([]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (labels.length > 0) {
			for (const _ of labels) {
				const { r, g, b } = randomRGBColor();
				const newBackgroundColor = `rgba(${r}, ${g}, ${b}, 0.7)`;
				const newBorderColor = `rgba(${r},${g},${b},1)`;
				setBackgroundColor((prev) => [...prev, newBackgroundColor]);
				setBorderColor((prev) => [...prev, newBorderColor]);
			}
		}
	}, [labels.length]);

	const donutChartData = {
		labels: labels,
		datasets: [
			{
				data: data,
				backgroundColor,
				borderColor,
				borderWidth: 1,
			},
		],
	};
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
						const percentage = Math.round((value / total) * 100);
						return `Count: ${value} (${percentage}%)`;
					},
				},
			},
		},
		cutout: '50%',
	};

	return {
		donutOptions,
		donutChartData,
	};
};

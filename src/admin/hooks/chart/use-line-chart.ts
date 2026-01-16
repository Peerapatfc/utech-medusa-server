import type { ChartOptions } from 'chart.js';

interface Props {
	xTitle?: string;
	yTitle?: string;
}
export const useLine = ({ xTitle, yTitle }: Props) => {
	const lineOptions: ChartOptions<'line'> = {
		responsive: true,
		plugins: {
			legend: {
				display: false,
			},
		},
		scales: {
			x: {
				title: {
					display: !!xTitle,
					text: xTitle,
				},
			},
			y: {
				title: {
					display: !!yTitle,
					text: yTitle,
				},
			},
		},
	};

	return { lineOptions };
};

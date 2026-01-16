import type { ChartOptions } from 'chart.js';

interface CustomOptions extends Partial<ChartOptions<'bar'>> {}

interface Props {
	originalLabels?: string[];
	options?: CustomOptions;
}

/**
 
 *
 * @param originalLabels - array for full labels display in tooltip of each item. 
 * @param options - Additional configuration options to customize the bar chart.
 * @returns An object containing the merged bar chart options.
 * 
 * @example
 * // Example usage with originalLabels
 * const data = {
 *   labels: ['Jan', 'Feb', 'Mar'],
 *   datasets: [{
 *     data: [10, 20, 30]
 *   }]
 * };
 * const { barOptions } = useBarChart({
 *   originalLabels: ['January 2023', 'February 2023', 'March 2023']
 * });
 */

export const useBarChart = ({ originalLabels = [], options }: Props) => {
	const defaultOptions: ChartOptions<'bar'> = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: {
				display: false,
				position: 'top' as const,
			},
			tooltip: {
				callbacks: {
					label: (context) => {
						const value = context.parsed.y;
						return `value: ${value}`;
					},
					title: (context) => {
						const index = context[0].dataIndex;
						if (originalLabels.length > 0) {
							return originalLabels[index];
						}
						return context[0].label;
					},
				},
			},
		},
		scales: {
			x: {
				ticks: {
					callback: function (value, index, ticks) {
						const maxLength = 20;
						const label = this.getLabelForValue(value as number);
						return label.length > maxLength
							? `${label.substring(0, maxLength)}...`
							: label;
					},
				},
			},
			y: {
				beginAtZero: true,
			},
		},
	};

	const barOptions = { ...defaultOptions, ...options };
	return {
		barOptions,
	};
};

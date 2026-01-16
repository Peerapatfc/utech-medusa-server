import { useState } from 'react';
import { ChartType } from '../../routes/dashboard/components/chart/chart-type-selector';

export const useChart = () => {
	const [chartType, setChartType] = useState<ChartType>(ChartType.BAR);

	return {
		chartType,
		setChartType,
	};
};

import { ChartBar, ChartPie } from '@medusajs/icons';
import { Button, Tooltip } from '@medusajs/ui';

export enum ChartType {
	BAR = 'bar',
	DONUT = 'donut',
}

interface Props {
	chartType: ChartType;
	onChange: (type: ChartType) => void;
}

const ChartTypeSelector = ({ chartType, onChange }: Props) => {
	return (
		<div className='flex items-center space-x-2'>
			<Tooltip content='Bar Chart'>
				<Button
					variant={chartType === ChartType.BAR ? 'primary' : 'secondary'}
					onClick={() => onChange(ChartType.BAR)}
				>
					<ChartBar />
				</Button>
			</Tooltip>
			<Tooltip content='Doughnut Chart'>
				<Button
					variant={chartType === ChartType.DONUT ? 'primary' : 'secondary'}
					onClick={() => onChange(ChartType.DONUT)}
				>
					<ChartPie />
				</Button>
			</Tooltip>
		</div>
	);
};

export default ChartTypeSelector;

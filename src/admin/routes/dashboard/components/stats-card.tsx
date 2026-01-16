interface StatsCardProps {
	title: string;
	value: string | number | undefined;
	isLoading: boolean;
}

const StatsCard = ({ title, value, isLoading }: StatsCardProps) => (
	<div className='w-full'>
		<h2 className='text-base font-bold'>{title}</h2>
		{isLoading ? (
			<div className='animate-pulse py-4'>
				<div className='w-1/4 h-6 bg-ui-bg-component-pressed' />
			</div>
		) : (
			<p className='text-2xl leading-normal font-bold text-amber-600 mt-[10px]'>
				{value}
			</p>
		)}
	</div>
);

export default StatsCard;

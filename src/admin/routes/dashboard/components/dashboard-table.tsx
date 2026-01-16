import { ExclamationCircle } from '@medusajs/icons';
import { Text } from '@medusajs/ui';
import { useTranslation } from 'react-i18next';
const DashboardTable = <T extends object>({
	title,
	headers,
	data,
	renderRow,
	isLoading,
}: {
	title: string;
	headers: string[];
	data: T[];
	renderRow: (item: T) => JSX.Element;
	isLoading: boolean;
}) => {
	const { t } = useTranslation();

	return (
		<div className='w-full lg:max-w-[500px] max-w-none'>
			<h2 className='text-base font-bold text-amber-600 mb-5'>{title}</h2>
			<div className='border-0 rounded-lg'>
				<table className='w-full'>
					<thead>
						<tr>
							{headers.map((header) => (
								<th
									key={header}
									className='px-4 py-2 text-center whitespace-nowrap'
								>
									{header}
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{isLoading ? (
							<tr>
								<td colSpan={headers.length} className='py-4 gap-2'>
									<div className='animate-pulse flex pt-2 gap-x-2'>
										<div className='w-2/6 h-5 bg-ui-bg-component-pressed' />
										<div className='w-2/6 h-5 bg-ui-bg-component-pressed' />
										<div className='w-2/6 h-5 bg-ui-bg-component-pressed' />
									</div>
									<div className='animate-pulse flex pt-2 gap-x-2'>
										<div className='w-2/6 h-5 bg-ui-bg-component-hover' />
										<div className='w-2/6 h-5 bg-ui-bg-component-hover' />
										<div className='w-2/6 h-5 bg-ui-bg-component-hover' />
									</div>
									<div className='animate-pulse flex pt-2 gap-x-2'>
										<div className='w-2/6 h-5 bg-ui-bg-component-hover' />
										<div className='w-2/6 h-5 bg-ui-bg-component-hover' />
										<div className='w-2/6 h-5 bg-ui-bg-component-hover' />
									</div>
									<div className='animate-pulse flex pt-2 gap-x-2'>
										<div className='w-2/6 h-5 bg-ui-bg-component-hover' />
										<div className='w-2/6 h-5 bg-ui-bg-component-hover' />
										<div className='w-2/6 h-5 bg-ui-bg-component-hover' />
									</div>
								</td>
							</tr>
						) : data?.length === 0 ? (
							<tr>
								<td
									colSpan={headers.length}
									className='py-4 text-center text-gray-500'
								>
									<div className='flex w-full flex-col items-center justify-center gap-y-4'>
										<Text
											size='small'
											className='text-ui-fg-muted flex gap-x-2'
										>
											<ExclamationCircle />
											{t('general.noRecordsMessage')}
										</Text>
									</div>
								</td>
							</tr>
						) : (
							data?.map(renderRow)
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
};

export default DashboardTable;

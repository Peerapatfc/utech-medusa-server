import { defineRouteConfig } from '@medusajs/admin-sdk';
import { DocumentText, Eye } from '@medusajs/icons';
import { Button, Container, DatePicker, toast } from '@medusajs/ui';
import { endOfDay, format } from 'date-fns';
import { useState } from 'react';
import { useMemo } from 'react';
import { NoResults } from '../../../components/common/empty-table-content/empty-table-content';
import { type BlogData, PreviewTable } from './components/preview-table';

const BlogPerformancePage = () => {
	const [isExportLoading, setIsExportLoading] = useState(false);
	const [isPreviewLoading, setIsPreviewLoading] = useState(false);
	const [startDate, setStartDate] = useState<Date | undefined>();
	const [endDate, setEndDate] = useState<Date | undefined>();
	const [previewData, setPreviewData] = useState<BlogData[]>([]);
	const [hasPreviewedData, setHasPreviewedData] = useState(false);

	const createDateRangeParams = (
		startDate: Date,
		endDate: Date,
	): URLSearchParams => {
		return new URLSearchParams({
			start_date: format(startDate, 'yyyy-MM-dd'),
			end_date: format(endDate, 'yyyy-MM-dd'),
		});
	};

	const isFormValid = useMemo(() => {
		if (!startDate || !endDate) return false;
		if (startDate > endOfDay(new Date())) return false;
		if (endDate < startDate) return false;
		return true;
	}, [startDate, endDate]);

	const handlePreview = async () => {
		if (!isFormValid) return;
		setIsPreviewLoading(true);

		try {
			if (!startDate || !endDate) return;
			const params = createDateRangeParams(startDate, endDate);

			const response = await fetch(`/admin/blog/preview?${params}`, {
				credentials: 'include',
			});

			if (!response.ok) {
				const error = await response.json();
				const message =
					error.errors?.[0]?.message || error.message || 'Preview failed';
				toast.error(message);
				return;
			}

			const data = await response.json();
			setPreviewData(data);
			setHasPreviewedData(true);
			toast.success('Preview loaded successfully!');
		} catch (error) {
			console.error('Preview error:', error);
			toast.error('Preview failed');
		} finally {
			setIsPreviewLoading(false);
		}
	};

	const handleExport = async () => {
		if (!isFormValid) return;
		setIsExportLoading(true);

		try {
			if (!startDate || !endDate) return;
			const params = createDateRangeParams(startDate, endDate);

			const response = await fetch(`/admin/blog/export?${params}`, {
				credentials: 'include',
			});

			if (!response.ok) {
				const error = await response.json();
				const message =
					error.errors?.[0]?.message || error.message || 'Export failed';
				toast.error(message);
				return;
			}

			const blob = await response.blob();
			const url = URL.createObjectURL(blob);
			const filename =
				response.headers
					.get('content-disposition')
					?.match(/filename="?([^"]+)"?/)?.[1] || 'blog-performance.csv';

			const link = document.createElement('a');
			link.href = url;
			link.download = filename;
			link.click();
			URL.revokeObjectURL(url);

			toast.success('Report exported successfully!');
		} catch (error) {
			console.error('Export error:', error);
			toast.error('Export failed');
		} finally {
			setIsExportLoading(false);
		}
	};

	return (
		<Container>
			<h1 className='text-xl font-bold mb-2'>Blog Performance Report</h1>
			<p className='mb-6 text-ui-fg-subtle'>
				Export blog performance data for a specific date range
			</p>

			<div className='bg-ui-bg-component p-6 rounded-lg border border-ui-border-base'>
				<div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
					<div>
						<label
							htmlFor='start-date'
							className='block text-sm font-medium mb-2 text-ui-fg-base'
						>
							Start Date *
						</label>
						<DatePicker
							id='start-date'
							value={startDate}
							onChange={(date) => setStartDate(date || undefined)}
						/>
					</div>
					<div>
						<label
							htmlFor='end-date'
							className='block text-sm font-medium mb-2 text-ui-fg-base'
						>
							End Date *
						</label>
						<DatePicker
							id='end-date'
							value={endDate}
							onChange={(date) => setEndDate(date || undefined)}
						/>
					</div>
				</div>

				<div className='flex gap-3'>
					<Button
						variant='secondary'
						onClick={handlePreview}
						isLoading={isPreviewLoading}
						disabled={isPreviewLoading || !isFormValid}
						className='min-w-[140px] !py-3 max-h-[34px]'
					>
						<Eye className='mr-2' />
						{isPreviewLoading ? 'Loading...' : 'Preview Data'}
					</Button>
					<Button
						variant='primary'
						onClick={handleExport}
						isLoading={isExportLoading}
						disabled={isExportLoading || !isFormValid}
						className='min-w-[140px] !py-3 max-h-[34px]'
					>
						<DocumentText className='mr-2' />
						{isExportLoading ? 'Exporting...' : 'Export CSV'}
					</Button>
				</div>
			</div>

			{hasPreviewedData &&
				(previewData.length > 0 ? (
					<PreviewTable data={previewData} />
				) : (
					<NoResults
						title='No blog data found'
						message='No blog posts were found for the selected date range. Try adjusting your date filters.'
						className='mt-6'
					/>
				))}
		</Container>
	);
};

export const config = defineRouteConfig({
	label: 'Performance Report',
});

export default BlogPerformancePage;

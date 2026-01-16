import { defineRouteConfig } from '@medusajs/admin-sdk';
import { ChartPie, DocumentText } from '@medusajs/icons';
import { Button, Container, toast } from '@medusajs/ui';
import { useState } from 'react';
import AdvancedSettingButton from '../../components/advanced-setting-button';
import { useMagentoOrderURL } from '../../hooks/api/advance-setting';
import localI18N from '../../i18n/config';

type Item = {
	id: string;
	title: string;
	sub_title: string;
	handleUrl: string;
	icon: JSX.Element;
};

const ReportsPage = () => {
	const { t } = localI18N;

	const magentoURL = useMagentoOrderURL();

	const items: Item[] = [
		{
			id: 'pre-order-report',
			title: t('report.pre_order.title'),
			sub_title: t('report.pre_order.sub_title'),
			handleUrl: '',
			icon: <ChartPie />,
		},
		{
			id: 'magento-order-report',
			title: 'Magento Order History',
			sub_title: 'Show magento order history',
			handleUrl: magentoURL,
			icon: <ChartPie />,
		},
	];

	const [isLoading, setIsLoading] = useState(false);

	const handleExport = async () => {
		setIsLoading(true);
		try {
			const response = await fetch('/admin/custom/orders/export', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
			});

			if (response.status === 200) {
				toast.success(t('report.export.completed.description'));
			}

			if (!response.ok) {
				toast.error(t('report.export.failed.description'));
			}
		} catch (error) {
			console.error('Export failed:', error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleGenerateButton = (item: Item) => {
		if (item.id === 'pre-order-report') {
			return (
				<Button
					variant='primary'
					onClick={handleExport}
					isLoading={isLoading}
					disabled={isLoading}
				>
					<DocumentText className='mr-2' />
					{isLoading ? t('actions.exporting') : t('actions.export')}
				</Button>
			);
		}
		return undefined;
	};

	return (
		<Container>
			<div className='flex items-center justify-between'>
				<div>
					<h1 style={{ fontWeight: '700', fontSize: '20px' }}>
						{t('report.title')}
					</h1>
					<p className='mt-4 mb-6'>{t('report.description')}</p>
				</div>
			</div>
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
				{items.map((item) => (
					<AdvancedSettingButton
						key={item.id}
						title={item.title}
						sub_title={item.sub_title}
						handleUrl={item.handleUrl}
						icon={item.icon}
						button={handleGenerateButton(item)}
					/>
				))}
			</div>
		</Container>
	);
};

export const config = defineRouteConfig({
	label: 'Reports',
	icon: ChartPie,
});

export default ReportsPage;

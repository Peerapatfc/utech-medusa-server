import { useTranslation } from 'react-i18next';
import type { Filter } from '../../../../../../components/table/data-table';
import { StoreNotificationCategoryOptions } from '../../../../common/utils';
// import { useDateTableFilters } from '../../../../../../hooks/table/filters/use-date-table-filters';

export const useBroadCastsTableFilters = () => {
	const { t } = useTranslation();

	// const dateFilters = useDateTableFilters()
	const dateFilters: Filter[] = [
		// {
		// 	label: t('fields.status'),
		// 	key: 'status',
		// 	type: 'select',
		// 	options: StoreNotificationStatusOptions
		// },
		{
			label: 'Category',
			key: 'category',
			type: 'select',
			options: StoreNotificationCategoryOptions,
		},
		{
			label: 'Recipient Type',
			key: 'recipient_type',
			type: 'select',
			options: [
				{
					value: 'all',
					label: 'All subscribers',
				},
				{
					value: 'targeting',
					label: 'Targeting',
				},
				{
					value: 'specific',
					label: 'Specify recipient',
				},
			],
		},
		{
			label: 'Broadcast Type',
			key: 'broadcast_type',
			type: 'select',
			options: [
				{
					value: 'now',
					label: 'Send now',
				},
				{
					value: 'scheduled',
					label: 'Set time period',
				},
			],
		},
		{
			label: 'Broadcast time',
			key: 'scheduled_at',
			type: 'date',
		},
		{
			label: t('fields.createdAt'),
			key: 'created_at',
			type: 'date',
		},
		{
			label: t('fields.updatedAt'),
			key: 'updated_at',
			type: 'date',
		},
	];

	return dateFilters;
};
